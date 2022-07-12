import { Test, TestingModule } from '@nestjs/testing';
import { ClientGroupService } from './client-group.service';

describe('ClientGroupService', () => {
  let service: ClientGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientGroupService],
    }).compile();

    service = module.get<ClientGroupService>(ClientGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
