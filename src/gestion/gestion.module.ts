import { Module } from '@nestjs/common';
import { GestionController } from './gestion.controller';
import { OracleService } from './oracle.service';

@Module({
  controllers: [GestionController],
  providers: [OracleService],
})
export class GestionModule {}