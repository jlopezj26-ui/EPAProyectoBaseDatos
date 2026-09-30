import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IProducto } from '../interfaces/producto.interface';

export class Producto implements IProducto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Teclado' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Teclado mecánico' })
  descripcion?: string;

  @ApiProperty({ example: 79.99 })
  precio!: number;

  @ApiProperty({ example: 10 })
  stock!: number;
}