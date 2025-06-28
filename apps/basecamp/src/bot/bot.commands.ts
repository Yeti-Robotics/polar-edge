import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class BotCommands {
  @SlashCommand({
    name: 'ping',
    description: 'Ping the bot',
    dmPermission: true,
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply(`Pong! ${interaction.client.ws.ping}ms`);
  }
}
