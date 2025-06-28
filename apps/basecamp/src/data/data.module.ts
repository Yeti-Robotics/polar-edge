import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { OutreachModule } from './outreach/outreach.module';
import { SheetModule } from '../sheet/sheet.module';

@Module({
  imports: [AttendanceModule, OutreachModule, SheetModule],
  exports: [AttendanceModule, OutreachModule],
})
export class DataModule {}
