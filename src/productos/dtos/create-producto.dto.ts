import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ example: 'Teclado', minLength: 2 })
  @IsString()
  @MinLength(2)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Teclado mecánico' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 79.99, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}