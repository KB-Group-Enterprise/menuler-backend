import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CreateRestaurantInput } from 'src/restaurant/dto/CreateRestaurantInput';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { restaurantStub } from '../../restaurant/test/stubs/restaurant.stub';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQrcodeInput } from '../dto/CreateQrcodeInput';
import { QrcodeService } from '../qrcode.service';
import { qrcodeStub } from '../stubs/qrcode.stub';

describe('QrcodeService', () => {
  let qrcodeService: QrcodeService;
  let restaurantService: RestaurantService;
  let restaurantId: string;
  const tableDetail: CreateQrcodeInput = {
    restaurantId: restaurantId,
    tableName: qrcodeStub().tableName,
    qrcodeSize: { height: 100, width: 100 },
  };
  const qrcodeResult = {
    ...qrcodeStub(),
    id: expect.any(String),
    tableToken: expect.any(String),
    qrcodeImageUrl: expect.any(String),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrcodeService, PrismaService, RestaurantService],
    }).compile();

    qrcodeService = module.get<QrcodeService>(QrcodeService);
    restaurantService = module.get(RestaurantService);
    try {
      const restaurantInput: CreateRestaurantInput = {
        location: restaurantStub().location,
        restaurantName: restaurantStub().restaurantName,
        status: restaurantStub().status,
      };
      const restaurant = await restaurantService.createRestaurant(
        restaurantInput,
      );
      tableDetail.restaurantId = restaurant.id;
    } catch (error) {}
  });

  afterEach(async () => {
    try {
      const targetToDelete: Prisma.QrcodeTableNameRestaurantIdCompoundUniqueInput =
        {
          restaurantId: qrcodeStub().restaurantId,
          tableName: qrcodeStub().tableName,
        };
      await qrcodeService.deleteQrcodeByTableNameAndRestaurantId(
        targetToDelete,
      );
      await restaurantService.deleteRestaurant(restaurantStub().restaurantName);
    } catch (error) {}
  });

  it('should be defined', () => {
    expect(qrcodeService).toBeDefined();
  });

  describe('generateQrcode', () => {
    it('should generate qrcode', async () => {
      const { isSuccess, qrcode } = await qrcodeService.generateQrcode(
        tableDetail,
      );
      expect(isSuccess).toBe(true);
      expect(qrcode).toEqual(qrcodeResult);
    });
    it('should throw conflict qrcode exception', async () => {
      try {
        await qrcodeService.generateQrcode(tableDetail);
        await qrcodeService.generateQrcode(tableDetail);
      } catch (error) {
        expect(error.status).toBe(409);
      }
    });
  });

  describe('findQrcodeByTableToken', () => {
    it('should return qrcode', async () => {
      const { isSuccess, qrcode } = await qrcodeService.generateQrcode(
        tableDetail,
      );
      const qrcodeByTableToken = await qrcodeService.findQrcodeByTableToken(
        qrcode.tableToken,
      );
      expect(isSuccess).toBe(true);
      expect(qrcodeByTableToken).toEqual(qrcodeResult);
    });

    it('should throw not found exception', async () => {
      try {
        await qrcodeService.findQrcodeByTableToken('something');
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });

    it('should return conflict qrcode', async () => {
      await qrcodeService.generateQrcode(tableDetail);
      const { isSuccess, qrcode } = await qrcodeService.generateQrcode(
        tableDetail,
      );
      expect(isSuccess).toBe(false);
      expect(qrcode).toEqual(qrcodeResult);
    });

    it('should throw not found restaurant', async () => {
      try {
        const temp = await qrcodeService.generateQrcode({
          restaurantId: 'wrongrestaurantId',
          qrcodeSize: tableDetail.qrcodeSize,
          tableName: 'dwpdlwpal',
        });
        console.log(temp);
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
