import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { SheetModule } from './sheet/sheet.module';
import { DataModule } from './data/data.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BotModule, SheetModule, DataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
