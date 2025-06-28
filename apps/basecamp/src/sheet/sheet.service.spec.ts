import { Test, TestingModule } from '@nestjs/testing';
import { SheetService } from './sheet.service';

describe('SheetService', () => {
  let service: SheetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheetService],
    }).compile();

    service = module.get<SheetService>(SheetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
