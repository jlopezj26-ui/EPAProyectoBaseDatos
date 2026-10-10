import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as oracledb from 'oracledb';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { CampoTabla, DefinicionTabla, TABLAS, obtenerTabla } from './tablas';

type Fila = Record<string, unknown>;

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  private pool?: oracledb.Pool;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const user = this.config.get<string>('ORACLE_USER');
    const password = this.config.get<string>('ORACLE_PASSWORD');
    const connectString = this.config.get<string>('ORACLE_CONNECT_STRING');
    if (!user || !password || !connectString) {
      throw new Error('Configura ORACLE_USER, ORACLE_PASSWORD y ORACLE_CONNECT_STRING en .env.');
    }

    const walletPath = this.config.get<string>('ORACLE_WALLET_DIR');
    const resolvedWalletPath = walletPath
      ? this.resolveWalletDirectory(isAbsolute(walletPath) ? walletPath : resolve(process.cwd(), walletPath))
      : undefined;

    const poolConfig: oracledb.PoolAttributes = {
      user,
      password,
      connectString,
      poolMin: 0,
      poolMax: 2,
      poolIncrement: 1,
      poolTimeout: 30,
      queueTimeout: 60000,
      enableStatistics: false,
    };

    if (resolvedWalletPath) {
      const walletPassword = this.config.get<string>('ORACLE_WALLET_PASSWORD');
      Object.assign(poolConfig, {
        configDir: resolvedWalletPath,
        walletLocation: resolvedWalletPath,
        ...(walletPassword ? { walletPassword } : {}),
      });
    }

    this.pool = await oracledb.createPool(poolConfig);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.close(10);
  }

  listarTablas() {
    return Object.values(TABLAS);
  }

  async listar(nombre: string): Promise<Fila[]> {
    const tabla = obtenerTabla(nombre);
    const rows = await this.consultar(
      `SELECT ${this.columnasSelect(tabla)} FROM ${tabla.tablaOracle} ORDER BY ${this.identificador(tabla.clavePrimaria)}`,
    );
    return rows.map((row) => this.normalizarFila(row));
  }

  async obtener(nombre: string, id: string): Promise<Fila> {
    const tabla = obtenerTabla(nombre);
    const valorId = this.validarId(id);
    const rows = await this.consultar(
      `SELECT ${this.columnasSelect(tabla)} FROM ${tabla.tablaOracle} WHERE ${this.identificador(tabla.clavePrimaria)} = :1`,
      [valorId],
    );
    if (!rows.length) throw new NotFoundException(`${tabla.etiqueta}: no existe el registro ${id}.`);
    return this.normalizarFila(rows[0]);
  }

  async crear(nombre: string, body: Fila): Promise<Fila> {
    const tabla = obtenerTabla(nombre);
    if (Object.prototype.hasOwnProperty.call(body, tabla.clavePrimaria)) {
      throw new BadRequestException(`No envíes ${tabla.clavePrimaria}; el módulo lo genera automáticamente.`);
    }
    const id = await this.siguienteId(tabla);
    const datos = { ...body, [tabla.clavePrimaria]: id };
    const campos = this.validarBody(tabla, datos, true);
    const columnas = campos.map((campo) => this.identificador(campo.columnaOracle ?? campo.nombre));
    const valores = campos.map((campo) => datos[campo.nombre]);
    const placeholders = campos.map((campo, index) => this.placeholder(campo, index + 1));
    await this.ejecutar(
      `INSERT INTO ${tabla.tablaOracle} (${columnas.join(', ')}) VALUES (${placeholders.join(', ')})`,
      valores,
    );
    return this.obtener(nombre, String(id));
  }

  async actualizar(nombre: string, id: string, body: Fila): Promise<Fila> {
    const tabla = obtenerTabla(nombre);
    const valorId = this.validarId(id);
    const campos = this.validarBody(tabla, body, false);
    if (!campos.length) throw new BadRequestException('Indica al menos un campo para actualizar.');
    const valores = campos.map((campo) => body[campo.nombre]);
    const asignaciones = campos.map((campo, index) =>
      `${this.identificador(campo.columnaOracle ?? campo.nombre)} = ${this.placeholder(campo, index + 1)}`,
    );
    const result = await this.ejecutar(
      `UPDATE ${tabla.tablaOracle} SET ${asignaciones.join(', ')} WHERE ${this.identificador(tabla.clavePrimaria)} = :${campos.length + 1}`,
      [...valores, valorId],
    );
    if (!result.rowsAffected) throw new NotFoundException(`${tabla.etiqueta}: no existe el registro ${id}.`);
    return this.obtener(nombre, id);
  }

  async eliminar(nombre: string, id: string): Promise<void> {
    const tabla = obtenerTabla(nombre);
    const result = await this.ejecutar(
      `DELETE FROM ${tabla.tablaOracle} WHERE ${this.identificador(tabla.clavePrimaria)} = :1`,
      [this.validarId(id)],
    );
    if (!result.rowsAffected) throw new NotFoundException(`${tabla.etiqueta}: no existe el registro ${id}.`);
  }

  private async consultar(sql: string, binds: unknown[] = []): Promise<Fila[]> {
    return this.conConexion(async (connection) => {
      try {
        const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return (result.rows ?? []) as Fila[];
      } catch (error) {
        this.traducirError(error);
      }
    });
  }

  private async ejecutar(sql: string, binds: unknown[] = []): Promise<oracledb.Result<unknown>> {
    return this.conConexion(async (connection) => {
      try {
        const result = await connection.execute(sql, binds, { autoCommit: true });
        return result;
      } catch (error) {
        this.traducirError(error);
      }
    });
  }

  private async siguienteId(tabla: DefinicionTabla): Promise<number> {
    const [row] = await this.consultar(
      `SELECT NVL(MAX(${this.identificador(tabla.clavePrimaria)}), -1) + 1 AS "SIGUIENTE_ID" FROM ${tabla.tablaOracle}`,
    );
    const id = Number(row?.SIGUIENTE_ID ?? 0);
    if (!Number.isInteger(id) || id > 99999) {
      throw new ConflictException(`No quedan IDs disponibles en ${tabla.tablaOracle} (NUMBER(5)).`);
    }
    return id;
  }

  private resolveWalletDirectory(root: string): string {
    if (!existsSync(root) || !statSync(root).isDirectory()) {
      throw new Error('ORACLE_WALLET_DIR debe apuntar a la carpeta extraída del wallet, no al archivo ZIP.');
    }
    const matches: string[] = [];
    const visit = (directory: string, depth: number) => {
      if (existsSync(join(directory, 'tnsnames.ora'))) {
        matches.push(directory);
        return;
      }
      if (depth >= 2) return;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) visit(join(directory, entry.name), depth + 1);
      }
    };

    visit(root, 0);
    if (matches.length > 1) {
      throw new Error('ORACLE_WALLET_DIR contiene varias carpetas wallet; indica la que contiene tnsnames.ora.');
    }
    return matches[0] ?? root;
  }

  private async conConexion<T>(operation: (connection: oracledb.Connection) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('El pool Oracle no está inicializado.');
    const connection = await this.pool.getConnection();
    try {
      return await operation(connection);
    } finally {
      await connection.close();
    }
  }

  private validarBody(tabla: DefinicionTabla, body: Fila, requiereId: boolean): CampoTabla[] {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('El cuerpo debe ser un objeto JSON.');
    }
    const permitidos = tabla.campos.filter((campo) => requiereId || !campo.clavePrimaria);
    const nombresPermitidos = new Set(permitidos.map((campo) => campo.nombre));
    const desconocidos = Object.keys(body).filter((nombre) => !nombresPermitidos.has(nombre));
    if (desconocidos.length) {
      throw new BadRequestException(`Campos no permitidos: ${desconocidos.join(', ')}.`);
    }
    if (requiereId && (body[tabla.clavePrimaria] === undefined || body[tabla.clavePrimaria] === null)) {
      throw new BadRequestException(`Debes indicar ${tabla.clavePrimaria}; el módulo no genera IDs.`);
    }
    const campos = permitidos.filter((campo) => Object.prototype.hasOwnProperty.call(body, campo.nombre));
    for (const campo of campos) this.validarValor(campo, body[campo.nombre]);
    return campos;
  }

  private validarValor(campo: CampoTabla, valor: unknown): void {
    if (valor === null || valor === undefined) return;
    if ((campo.tipo === 'entero' || campo.tipo === 'decimal') &&
      (typeof valor !== 'number' || !Number.isFinite(valor) ||
        (campo.tipo === 'entero' && !Number.isInteger(valor)))) {
      throw new BadRequestException(`${campo.etiqueta} debe ser un número${campo.tipo === 'entero' ? ' entero' : ''}.`);
    }
    if (campo.tipo === 'texto' && typeof valor !== 'string') {
      throw new BadRequestException(`${campo.etiqueta} debe ser texto.`);
    }
    if (campo.tipo === 'texto' && campo.longitud && (valor as string).length > campo.longitud) {
      throw new BadRequestException(`${campo.etiqueta} admite hasta ${campo.longitud} caracteres.`);
    }
    if (campo.tipo === 'fecha' && (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor))) {
      throw new BadRequestException(`${campo.etiqueta} debe usar el formato AAAA-MM-DD.`);
    }
  }

  private placeholder(campo: CampoTabla, indice: number): string {
    return campo.tipo === 'fecha' ? `TO_DATE(:${indice}, 'YYYY-MM-DD')` : `:${indice}`;
  }

  private identificador(nombre: string): string {
    return `"${nombre.toUpperCase()}"`;
  }

  private columnasSelect(tabla: DefinicionTabla): string {
    return tabla.campos
      .map((campo) => `${this.identificador(campo.columnaOracle ?? campo.nombre)} AS ${this.identificador(campo.nombre)}`)
      .join(', ');
  }

  private validarId(id: string): number {
    const value = Number(id);
    if (!Number.isInteger(value) || value < 0 || value > 99999) {
      throw new BadRequestException('El ID debe ser un entero entre 0 y 99999.');
    }
    return value;
  }

  private normalizarFila(row: Fila): Fila {
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
  }

  private traducirError(error: unknown): never {
    const errorNum = (error as { errorNum?: number })?.errorNum;
    if (errorNum === 1 || errorNum === 2291 || errorNum === 2292) {
      throw new ConflictException('La operación infringe una clave única o una relación entre tablas.');
    }
    if (errorNum === 1400 || errorNum === 12899 || errorNum === 1438) {
      throw new BadRequestException('Los datos no cumplen las restricciones de la tabla Oracle.');
    }
    throw error;
  }
}