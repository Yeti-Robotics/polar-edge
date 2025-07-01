import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { AttendanceService } from '../data/attendance/attendance.service';
import { OutreachService } from 'src/data/outreach/outreach.service';
import { ChatInputCommandInteraction } from 'discord.js';

@Injectable()
export class BotCommands {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly outreachService: OutreachService,
  ) {}

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
    description: 'Sign in to a YETI meeting at the zone',
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
    description: 'Sign out of a YETI meeting at the zone',
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

  @SlashCommand({
    name: 'outreach',
    description: 'Get your current outreach progress',
  })
  public async onOutreach(@Context() [interaction]: SlashCommandContext) {
    const nickname = await this.getNickname(interaction);

    if (!nickname) {
      return interaction.reply('You must have a nickname set to get outreach');
    }

    const outreach = await this.outreachService.getUserOutreach(nickname);

    if (!outreach) {
      return interaction.reply('No outreach found for you');
    }

    const hourTotal = outreach.reduce((acc, curr) => acc + curr.hours, 0);

    let outreachString = `:snowflake: Outreach for ${nickname} :snowflake:\n\n**Total hours:** ${hourTotal}`;

    if (hourTotal < 50) {
      outreachString += `\n- You need ${50 - hourTotal} more hours to reach the rookie minimum (${Math.round(
        (100 * hourTotal) / 50,
      )}% complete)\n- You need ${100 - hourTotal} more hours to reach the veteran minimum (${Math.round(
        (100 * hourTotal) / 100,
      )}% complete)`;
    } else if (hourTotal < 100) {
      outreachString += `\n- ✅ Rookie minimum achieved!\n- You need ${100 - hourTotal} more hours to reach the veteran minimum (${Math.round(
        (100 * hourTotal) / 100,
      )}% complete)`;
    } else {
      outreachString += `\n- 🎉 Veteran minimum achieved! Great work!`;
    }

    outreachString +=
      '\n*Please reach out to Ms. I in the <#408795997410426880> if you feel our record of your outreach is incorrect*';

    return interaction.reply(outreachString);
  }

  @SlashCommand({
    name: 'leaderboard',
    description: 'Show the top 5 members by outreach hours',
  })
  public async onLeaderboard(@Context() [interaction]: SlashCommandContext) {
    const leaderboard = await this.outreachService.getTopMembersByHours(5);

    if (!leaderboard || leaderboard.length === 0) {
      return interaction.reply('No outreach data found');
    }

    let leaderboardString = ':trophy: **Outreach Leaderboard** :trophy:\n\n';

    leaderboard.forEach((entry, index) => {
      const rank = index + 1;
      let prefix = '';

      // Medal emojis for top 3, numbers for 4th and 5th
      switch (rank) {
        case 1:
          prefix = ':first_place_medal:';
          break;
        case 2:
          prefix = ':second_place_medal:';
          break;
        case 3:
          prefix = ':third_place_medal:';
          break;
        case 4:
          prefix = '4.';
          break;
        case 5:
          prefix = '5.';
          break;
      }

      leaderboardString += `${prefix} **${entry.userName}** - ${entry.totalHours} hours\n`;
    });

    leaderboardString += '\n*Updated in real-time from outreach records*';

    return interaction.reply(leaderboardString);
  }
}
