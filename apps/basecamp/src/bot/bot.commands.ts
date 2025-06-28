import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { AttendanceService } from '../data/attendance/attendance.service';
import { ChatInputCommandInteraction } from 'discord.js';

@Injectable()
export class BotCommands {
  constructor(private readonly attendanceService: AttendanceService) {}

  private async getNickname(interaction: ChatInputCommandInteraction) {
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    return member?.nickname || null;
  }

  @SlashCommand({
    name: 'ping',
    description: 'Ping the bot',
    dmPermission: true,
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply(`Pong! ${interaction.client.ws.ping}ms`);
  }

  @SlashCommand({
    name: 'signin',
    description: 'Sign in to the server',
  })
  public async onSignIn(@Context() [interaction]: SlashCommandContext) {
    const nickname = await this.getNickname(interaction);

    if (!nickname) {
      return interaction.reply('You must have a nickname to sign in');
    }

    const result = await this.attendanceService.signIn(
      interaction.user.id,
      interaction.guild?.id || '',
      nickname,
    );

    if (result.success) {
      return interaction.reply('Signed in successfully');
    } else {
      return interaction.reply(result.message);
    }
  }

  @SlashCommand({
    name: 'signout',
    description: 'Sign out of the server',
  })
  public async onSignOut(@Context() [interaction]: SlashCommandContext) {
    const nickname = await this.getNickname(interaction);

    if (!nickname) {
      return interaction.reply('You must have a nickname to sign out');
    }

    const result = await this.attendanceService.signOut(
      interaction.user.id,
      interaction.guildId || '',
      nickname,
    );

    if (result.success) {
      return interaction.reply('Signed out successfully');
    } else {
      return interaction.reply(result.message);
    }
  }
}
