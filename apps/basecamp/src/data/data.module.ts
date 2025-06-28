import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { OutreachModule } from './outreach/outreach.module';

@Module({
  imports: [AttendanceModule, OutreachModule]
})
export class DataModule {}
