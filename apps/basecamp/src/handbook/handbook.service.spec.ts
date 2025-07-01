import { Test, TestingModule } from '@nestjs/testing';
import { HandbookService } from './handbook.service';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';

describe('HandbookService', () => {
  let service: HandbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandbookService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AiService,
          useValue: {
            models: {
              getAiClient: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HandbookService>(HandbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
