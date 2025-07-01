import { Module } from '@nestjs/common';
import { HandbookService } from './handbook.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [HandbookService],
  exports: [HandbookService],
})
export class HandbookModule {}
