import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OracleService } from './oracle.service';
import { obtenerTabla } from './tablas';

@ApiTags('gestión de base de datos')
@Controller('gestion')
export class GestionController {
  constructor(private readonly oracle: OracleService) {}

  @Get('tablas')
  listarTablas() {
    return this.oracle.listarTablas();
  }

  @Get(':tabla')
  listar(@Param('tabla') tabla: string) {
    obtenerTabla(tabla);
    return this.oracle.listar(tabla);
  }

  @Get(':tabla/:id')
  obtener(@Param('tabla') tabla: string, @Param('id') id: string) {
    obtenerTabla(tabla);
    return this.oracle.obtener(tabla, id);
  }

  @Post(':tabla')
  crear(@Param('tabla') tabla: string, @Body() body: Record<string, unknown>) {
    obtenerTabla(tabla);
    return this.oracle.crear(tabla, body);
  }

  @Patch(':tabla/:id')
  actualizar(
    @Param('tabla') tabla: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    obtenerTabla(tabla);
    return this.oracle.actualizar(tabla, id, body);
  }

  @Delete(':tabla/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('tabla') tabla: string, @Param('id') id: string): Promise<void> {
    obtenerTabla(tabla);
    return this.oracle.eliminar(tabla, id);
  }
}