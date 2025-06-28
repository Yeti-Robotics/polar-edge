import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { BotCommands } from './bot.commands';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    NecordModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('DISCORD_TOKEN');
        const devGuildId = configService.get<string>('DEV_GUILD_ID');
        if (!token) {
          throw new Error('DISCORD_TOKEN is not set');
        }
        return {
          token,
          development: devGuildId ? [devGuildId] : false,
          intents: [IntentsBitField.Flags.Guilds],
        };
      },
      inject: [ConfigService],
    }),
    DataModule,
  ],
  providers: [BotCommands],
})
export class BotModule {}
