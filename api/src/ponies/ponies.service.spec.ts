import { Test, TestingModule } from '@nestjs/testing';
import { PoniesService } from './ponies.service';

describe('PoniesService', () => {
  let service: PoniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoniesService],
    }).compile();

    service = module.get<PoniesService>(PoniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
