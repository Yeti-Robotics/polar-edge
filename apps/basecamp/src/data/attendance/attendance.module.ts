import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SheetModule } from '../../sheet/sheet.module';

@Module({
  imports: [SheetModule],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
