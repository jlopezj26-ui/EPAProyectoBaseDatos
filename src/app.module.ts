import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/modules/productos.module';

@Module({
  imports: [ProductosModule],
})
export class AppModule {}