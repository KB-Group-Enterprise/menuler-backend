import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from '../menu.service';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuService],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('addMenu', () => {
    // TODO check conflict,success array
    // TODO test checkExistMenu
  });

  it.todo('checkExistMenu', () => {
    // TODO expect true
    // TODO expect false
  });

  it.todo('updateMenu', () => {
    // TODO expect updateMenu data
    // TODO expect prisma error
  });

  it.todo('findAllMenuByRestaurantId', () => {
    // TODO expect menu only in that restaurant
  });

  it.todo('findMenuById', () => {
    // TODO expect menu
  });

  it.todo('deleteMenu', () => {
    // TODO expect does not exist data after delete
    // TODO expect prisma exception
  });
});
