import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class CrearVentaDetalleDto {
  @IsInt()
  @Min(0)
  id_producto!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CrearVentaDto {
  @IsInt()
  @Min(0)
  id_cliente!: number;

  @IsInt()
  @Min(0)
  id_sucursal!: number;

  @IsInt()
  @Min(0)
  id_empleado!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearVentaDetalleDto)
  detalles!: CrearVentaDetalleDto[];
}
