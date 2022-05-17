import { Test } from '@nestjs/testing';
import { Prisma, Restaurant } from '@prisma/client';
import { QrcodeService } from '../../qrcode/qrcode.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantService } from '../restaurant.service';
import { restaurantStub } from './stubs/restaurant.stub';

describe('RestaurantService', () => {
  let restaurantService: RestaurantService;
  let prismaService: PrismaService;
  let mockRestaurant: Restaurant;
  beforeEach(async () => {
    // const mockPrismaService = {
    //   restaurant: {
    //     create: jest.fn().mockImplementation(() => ({})),
    //     findUnique: jest.fn().mockImplementation(() => ({})),
    //   },
    // };
    // const mockRestaurantService = {
    //   createRestaurant: jest.fn().mockImplementation(() => restaurantStub()),
    // };
    const moduleRef = await Test.createTestingModule({
      providers: [RestaurantService, PrismaService, QrcodeService],
      // providers: [
      //   {
      //     provide: PrismaService,
      //     useValue: mockPrismaService,
      //   },
      //   {
      //     provide: RestaurantService,
      //     useValue: mockRestaurantService,
      //   },
      // ],
    }).compile();
    restaurantService = moduleRef.get<RestaurantService>(RestaurantService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    // jest.clearAllMocks();
    // const restaurantInput: Prisma.RestaurantCreateInput = {
    //   location: restaurantStub().location,
    //   restaurantName: restaurantStub().restaurantName,
    //   registerOn: restaurantStub().registerOn,
    // };
  });
  afterEach(async () => {
    try {
      await restaurantService.deleteRestaurant(restaurantStub().restaurantName);
    } catch (error) {}
  });
  it('it should be defined', async () => {
    expect(restaurantService).toBeDefined();
  });

  describe('createRestaurant', () => {
    const restaurantInput: Prisma.RestaurantCreateInput = {
      location: restaurantStub().location,
      restaurantName: restaurantStub().restaurantName,
      registerOn: restaurantStub().registerOn,
    };
    it('should create restaurant', async () => {
      // const restaurant = await restaurantService.createRestaurant(
      //   restaurantInput,
      // );
      // expect(restaurant).toEqual({
      //   ...restaurantStub(),
      //   id: expect.any(String),
      // });
    });
    it('should throw conflict exception', async () => {
      try {
        // await restaurantService.createRestaurant(restaurantInput);
        // await restaurantService.createRestaurant(restaurantInput);
      } catch (error) {
        expect(error.status).toBe(409);
      }
    });
    // TODO check restaurantId in admin after createRestaurant
  });
});
