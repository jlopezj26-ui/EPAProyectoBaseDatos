import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrearVentaDto } from './dtos/crear-venta.dto';
import { OracleService } from './oracle.service';

@ApiTags('ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly oracle: OracleService) {}

  @Post()
  crear(@Body() body: CrearVentaDto) {
    return this.oracle.crearVenta(body);
  }
}
