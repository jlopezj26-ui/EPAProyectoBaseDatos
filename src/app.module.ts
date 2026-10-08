import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GestionModule } from './gestion/gestion.module';
import { ProductosModule } from './productos/modules/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'frontend/.env'],
    }),
    ProductosModule,
    GestionModule,
  ],
})
export class AppModule {}