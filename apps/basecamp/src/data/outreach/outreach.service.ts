import { Injectable } from '@nestjs/common';
import { SheetService } from '../../sheet/sheet.service';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const OutreachColumnSchema = z.object({
  date: z.string(),
  userName: z.string(),
  event: z.string(),
  eventType: z.string(),
  hours: z.number(),
});

@Injectable()
export class OutreachService {
  private readonly outreachSheetId: string;

  constructor(
    private readonly sheetService: SheetService,
    private readonly configService: ConfigService,
  ) {
    const outreachSheetId = this.configService.get<string>(
      'OUTREACH_SPREADSHEET_ID',
    );

    if (!outreachSheetId) {
      throw new Error('OUTREACH_SPREADSHEET_ID is not set');
    }

    this.outreachSheetId = outreachSheetId;
  }

  async getUserOutreach(userName: string) {
    try {
      const sheet = await this.sheetService.getSheetValues(
        this.outreachSheetId,
        'OutreachInput!A:E',
      );

      if (!sheet) {
        return null;
      }

      const userOutreach = sheet.filter((row) => row[1] === userName);

      return userOutreach.map((row) =>
        OutreachColumnSchema.parse({
          date: row[0],
          userName: row[1],
          event: row[2],
          eventType: row[3],
          hours: Number(row[4]),
        }),
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
