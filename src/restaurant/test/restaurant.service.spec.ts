import { Test } from '@nestjs/testing';
import { Prisma, Restaurant } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantService } from '../restaurant.service';
import { restaurantStub } from './stubs/restaurant.stub';

jest.mock('../restaurant.service');

describe('RestaurantService', () => {
  let restaurantService: RestaurantService;

  beforeEach(async () => {
    const moduelRef = await Test.createTestingModule({
      providers: [RestaurantService],
    }).compile();
    restaurantService = moduelRef.get<RestaurantService>(RestaurantService);
    jest.clearAllMocks();
  });
  it('it should be defined', () => {
    expect(restaurantService).toBeDefined();
  });
});
// describe('createRestaurant', () => {
//   describe('when createRestaurant is called', () => {
//     let restaurant: Restaurant;

//     const restaurantInput: Prisma.RestaurantCreateInput = {
//       location: restaurantStub().location,
//       restaurantName: restaurantStub().restaurantName,
//       registerOn: restaurantStub().registerOn,
//     };
//     // const createRestaurantInput: CreateRestaurantInput = {
//     //   location: restaurantStub().location,
//     //   restaurantName: restaurantStub().restaurantName,
//     //   status: 'OPEN',
//     // };
//     it('should return restaurant', async () => {
//       jest
//         .spyOn(restaurantService, 'createRestaurant')
//         .mockResolvedValue(restaurantStub());
//       expect(await restaurantService.createRestaurant(restaurantInput)).toBe(
//         restaurantStub(),
//       );
//     });
//   });
// });
// });
