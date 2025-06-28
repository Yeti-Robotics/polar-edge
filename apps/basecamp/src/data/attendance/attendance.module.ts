import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Module({
  providers: [AttendanceService]
})
export class AttendanceModule {}
