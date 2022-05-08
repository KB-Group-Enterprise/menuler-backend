import { Test } from '@nestjs/testing';
import { Prisma, Restaurant } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRestaurantInput } from '../dto/CreateRestaurantInput';
import { RestaurantController } from '../restaurant.controller';
import { RestaurantService } from '../restaurant.service';
import { restaurantStub } from './stubs/restaurant.stub';

jest.mock('../restaurant.service');

describe('RestaurantService', () => {
  let restaurantService: RestaurantService;
  let restaurantController: RestaurantController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [RestaurantService],
    }).compile();
    restaurantController =
      moduleRef.get<RestaurantController>(RestaurantController);
    restaurantService = moduleRef.get<RestaurantService>(RestaurantService);
    jest.clearAllMocks();
  });

  describe('createRestaurant', () => {
    describe('when createRestaurant is called', () => {
      beforeEach(() => {
        jest
          .spyOn(restaurantService, 'createRestaurant')
          .mockResolvedValue(restaurantStub());
      });
      const createRestaurantInput: CreateRestaurantInput = {
        location: restaurantStub().location,
        restaurantName: restaurantStub().restaurantName,
        status: 'OPEN',
      };
      it('should return restaurant', async () => {
        expect(
          await restaurantController.createRestaurant(createRestaurantInput),
        ).toStrictEqual(restaurantStub());
      });
      // TODO conflict
      // it('should return conflict', async () => {
      //   expect(
      //     await restaurantController.createRestaurant(createRestaurantInput),
      //   ).toThrow;
      // });
    });
  });
});
