import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { BotCommands } from './bot.commands';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  providers: [BotCommands],
})
export class BotModule {}
