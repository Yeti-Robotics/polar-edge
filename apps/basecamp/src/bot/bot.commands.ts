import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { AttendanceService } from '../data/attendance/attendance.service';
import { OutreachService } from 'src/data/outreach/outreach.service';
import { ChatInputCommandInteraction } from 'discord.js';
import { HandbookService } from 'src/handbook/handbook.service';
import { HandbookQuestionDto } from 'src/handbook/handbook-question.dto';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message: string;
}

@Injectable()
export class BotCommands {
  private readonly logger = new Logger(BotCommands.name);

  // Global rate limiting
  private readonly globalRequests: number[] = [];
  private readonly globalRateLimit: RateLimitConfig = {
    maxRequests: 2, // 10 requests per minute
    windowMs: 60000, // 1 minute
    message:
      '🌐 The handbook is currently busy. Please try again in {time} seconds.',
  };
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly outreachService: OutreachService,
    private readonly handbookService: HandbookService,
  ) {
    // Clean up old requests periodically
    setInterval(() => this.cleanupRequests(), 30000); // Every 30 seconds
  }

  private cleanupRequests() {
    const now = Date.now();

    // Clean global requests
    while (
      this.globalRequests.length > 0 &&
      now - this.globalRequests[0] > this.globalRateLimit.windowMs
    ) {
      this.globalRequests.shift();
    }
  }

  private checkRateLimit(
    requests: number[],
    config: RateLimitConfig,
  ): { limited: boolean; waitTime?: number } {
    const now = Date.now();

    // Remove old requests
    while (requests.length > 0 && now - requests[0] > config.windowMs) {
      requests.shift();
    }

    if (requests.length >= config.maxRequests) {
      const oldestRequest = requests[0];
      const waitTime = Math.ceil(
        (oldestRequest + config.windowMs - now) / 1000,
      );
      return { limited: true, waitTime };
    }

    return { limited: false };
  }

  private addRequest(requests: number[]) {
    requests.push(Date.now());
  }

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
      '\n*Please reach out to Ms. I in <#408795997410426880> if you feel our record of your outreach is incorrect*';

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

  @SlashCommand({
    name: 'handbook',
    description: 'Ask the handbook a question',
  })
  public async onHandbook(
    @Context() [interaction]: SlashCommandContext,
    @Options() { question }: HandbookQuestionDto,
  ) {
    const userId = interaction.user.id;

    // Check global rate limit
    const globalLimit = this.checkRateLimit(
      this.globalRequests,
      this.globalRateLimit,
    );
    if (globalLimit.limited) {
      this.logger.warn(`Global rate limit reached. User ${userId} blocked.`);
      return interaction.reply({
        content: this.globalRateLimit.message.replace(
          '{time}',
          globalLimit.waitTime!.toString(),
        ),
        ephemeral: true,
      });
    }

    if (!question) {
      return interaction.reply('Please provide a question to ask the handbook');
    }

    // Add requests to both counters
    this.addRequest(this.globalRequests);

    this.logger.log(
      `Handbook request from user ${userId}: ${question.substring(0, 50)}...`,
    );

    try {
      const response = await this.handbookService.askHandbookQuestion(question);

      if (!response) {
        return interaction.reply(
          'Failed to get a response from the handbook agent.',
        );
      }

      return interaction.reply(`Question: ${question}\n\nAnswer: ${response}`);
    } catch (error) {
      this.logger.error(`Handbook request failed for user ${userId}:`, error);
      throw error;
    }
  }
}
