import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { SheetModule } from './sheet/sheet.module';
import { AiModule } from './ai/ai.module';
import { HandbookModule } from './handbook/handbook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    SheetModule,
    AiModule,
    HandbookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
