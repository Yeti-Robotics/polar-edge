import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SheetService } from 'src/sheet/sheet.service';
import z from 'zod';

const AttendanceSchema = z.object({
  discordId: z.string(),
  discordName: z.string(),
  date: z.string(),
  isSigningIn: z.boolean(),
});

type AttendanceOperationResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

@Injectable()
export class AttendanceService {
  private readonly attendanceSheetId: string;
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly sheetService: SheetService,
    private readonly configService: ConfigService,
  ) {
    const attendanceSheetId = this.configService.get<string>(
      'ATTENDANCE_SPREADSHEET_ID',
    );

    if (!attendanceSheetId) {
      throw new Error('ATTENDANCE_SPREADSHEET_ID is not set');
    }

    this.attendanceSheetId = attendanceSheetId;
  }

  private async performAttendanceOperation(
    discordId: string,
    discordName: string,
    operation: 'signIn' | 'signOut',
    date: Date = new Date(),
  ): Promise<boolean> {
    const attendance = AttendanceSchema.parse({
      discordId,
      discordName,
      date: date.toISOString(),
      isSigningIn: operation === 'signIn',
    });

    try {
      const result = await this.sheetService.appendSheetValues(
        this.attendanceSheetId,
        'Attendance!A:D',
        [
          ['discordId', 'discordName', 'date', 'isSigningIn'].map((value) =>
            attendance[value as keyof typeof attendance].toString(),
          ),
        ],
      );

      if (result.updates?.updatedRows && result.updates.updatedRows >= 1) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to perform attendance operation: ${error}`);
      return false;
    }
  }

  public async getAttendance(
    discordId: string,
  ): Promise<z.infer<typeof AttendanceSchema>[]> {
    const attendance = (await this.sheetService.getSheetValues(
      this.attendanceSheetId,
      `Attendance!A:D`,
    )) as unknown[][];

    if (!attendance) {
      return [];
    }

    const userAttendance = attendance.filter((row) => row[0] === discordId);

    return userAttendance.map((row) => {
      return AttendanceSchema.parse({
        discordId: row[0],
        discordName: row[1],
        date: row[2],
        isSigningIn: row[3] === 'true',
      });
    });
  }

  public async signIn(
    discordId: string,
    discordName: string,
  ): Promise<AttendanceOperationResult> {
    const existingAttendance = await this.getAttendance(discordId);

    const lastOperation = existingAttendance.at(-1);

    if (lastOperation?.isSigningIn) {
      const lastDate = new Date(lastOperation.date);
      const currentDate = new Date();

      if (currentDate.getTime() - lastDate.getTime() < 1000 * 60 * 60 * 3) {
        return {
          success: false,
          message: 'You are currently signed in.',
        };
      } else {
        try {
          await this.performAttendanceOperation(
            discordId,
            discordName,
            'signOut',
            new Date(currentDate.getTime() - 1000 * 60 * 60 * 1.5),
          );
        } catch (error) {
          this.logger.error(`Failed to sign in: ${error}`);
          return {
            success: false,
            message: 'Failed to sign in.',
          };
        }
      }
    }

    try {
      await this.performAttendanceOperation(discordId, discordName, 'signIn');
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to sign in: ${error}`);
      return {
        success: false,
        message: 'Failed to sign in.',
      };
    }
  }

  public async signOut(
    discordId: string,
    discordName: string,
  ): Promise<AttendanceOperationResult> {
    const existingAttendance = await this.getAttendance(discordId);

    const lastOperation = existingAttendance.at(-1);

    if (!lastOperation?.isSigningIn) {
      return {
        success: false,
        message: 'You are not signed in.',
      };
    } else if (
      new Date().getTime() - new Date(lastOperation.date).getTime() >
      1000 * 60 * 60 * 18
    ) {
      try {
        await this.performAttendanceOperation(
          discordId,
          discordName,
          'signIn',
          new Date(new Date().getTime() - 1000 * 60 * 60 * 1.5),
        );
      } catch (error) {
        this.logger.error(`Failed to sign out: ${error}`);
        return {
          success: false,
          message: 'Failed to sign out.',
        };
      }
    }

    try {
      await this.performAttendanceOperation(discordId, discordName, 'signOut');
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to sign out: ${error}`);
      return {
        success: false,
        message: 'Failed to sign out.',
      };
    }
  }
}
