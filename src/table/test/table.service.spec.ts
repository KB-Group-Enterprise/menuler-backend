import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CreateRestaurantInput } from 'src/restaurant/dto/restaurant/CreateRestaurantInput';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { restaurantStub } from '../../restaurant/test/stubs/restaurant.stub';
import { PrismaService } from '../../prisma/prisma.service';
import { TableService } from '../table.service';
import { qrcodeStub } from '../stubs/qrcode.stub';
import { TableInput } from '../dto/TableInput.dto';

describe('QrcodeService', () => {
  let tableService: TableService;
  let restaurantService: RestaurantService;
  let restaurantId: string;
  const tableDetail: TableInput = {
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
      providers: [TableService, PrismaService, RestaurantService],
    }).compile();

    tableService = module.get<TableService>(TableService);
    restaurantService = module.get(RestaurantService);
    try {
      const restaurantInput: CreateRestaurantInput = {
        location: restaurantStub().location,
        restaurantName: restaurantStub().restaurantName,
        status: restaurantStub().status,
      };
      // const restaurant = await restaurantService.createRestaurant(
      //   restaurantInput,
      // );
      // tableDetail.restaurantId = restaurant.id;
    } catch (error) {}
  });

  afterEach(async () => {
    try {
      const targetToDelete: Prisma.TableTableNameRestaurantIdCompoundUniqueInput =
        {
          restaurantId: qrcodeStub().restaurantId,
          tableName: qrcodeStub().tableName,
        };
      await tableService.deleteTableByTableNameAndRestaurantId(targetToDelete);
      await restaurantService.deleteRestaurant(restaurantStub().restaurantName);
    } catch (error) {}
  });

  it('should be defined', () => {
    expect(tableService).toBeDefined();
  });

  describe('generateQrcode', () => {
    it('should generate qrcode', async () => {
      // const { isSuccess, table } = await tableService.generateQrcode(
      //   tableDetail,
      // );
      // expect(isSuccess).toBe(true);
      // expect(table).toEqual(qrcodeResult);
    });
    it('should throw conflict qrcode exception', async () => {
      try {
        // await tableService.generateQrcode(tableDetail);
        // await tableService.generateQrcode(tableDetail);
      } catch (error) {
        expect(error.status).toBe(409);
      }
    });
  });

  describe('findQrcodeByTableToken', () => {
    it('should return qrcode', async () => {
      // const { isSuccess, table } = await tableService.generateQrcode(
      //   tableDetail,
      // );
      // const qrcodeByTableToken = await tableService.findTableByTableToken(
      //   table.tableToken,
      // );
      // expect(isSuccess).toBe(true);
      // expect(qrcodeByTableToken).toEqual(qrcodeResult);
    });

    it('should throw not found exception', async () => {
      try {
        await tableService.findTableByTableToken('something');
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });

    it('should return conflict qrcode', async () => {
      // await tableService.generateQrcode(tableDetail);
      // const { isSuccess, table } = await tableService.generateQrcode(
      //   tableDetail,
      // );
      // expect(isSuccess).toBe(false);
      // expect(table).toEqual(qrcodeResult);
    });

    it('should throw not found restaurant', async () => {
      try {
        // const temp = await tableService.generateQrcode({
        //   restaurantId: 'wrongrestaurantId',
        //   qrcodeSize: tableDetail.qrcodeSize,
        //   tableName: 'dwpdlwpal',
        // });
        // console.log(temp);
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
