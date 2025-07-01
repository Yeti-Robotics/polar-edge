import { Test, TestingModule } from '@nestjs/testing';
import { HandbookService } from './handbook.service';

describe('HandbookService', () => {
  let service: HandbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandbookService],
    }).compile();

    service = module.get<HandbookService>(HandbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
