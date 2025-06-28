import { Test, TestingModule } from '@nestjs/testing';
import { OutreachService } from './outreach.service';
import { SheetService } from '../../sheet/sheet.service';
import { ConfigService } from '@nestjs/config';

describe('OutreachService', () => {
  let service: OutreachService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutreachService,
        {
          provide: SheetService,
          useValue: {
            getSheetValues: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1234567890'),
          },
        },
      ],
    }).compile();

    service = module.get<OutreachService>(OutreachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
