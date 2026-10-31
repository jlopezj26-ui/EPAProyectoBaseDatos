import { Module } from '@nestjs/common';
import { GestionController } from './gestion.controller';
import { OracleService } from './oracle.service';
import { VentasController } from './ventas.controller';

@Module({
  controllers: [GestionController, VentasController],
  providers: [OracleService],
})
export class GestionModule {}