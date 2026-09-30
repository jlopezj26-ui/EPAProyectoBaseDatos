import { Module } from '@nestjs/common';
import { ProductosController } from '../controllers/productos.controller';
import { PRODUCTOS_SERVICE } from '../interfaces/productos-service.interface';
import { ProductosService } from '../services/productos.service';

@Module({
  controllers: [ProductosController],
  providers: [
    {
      provide: PRODUCTOS_SERVICE,
      useClass: ProductosService,
    },
  ],
})
export class ProductosModule {}