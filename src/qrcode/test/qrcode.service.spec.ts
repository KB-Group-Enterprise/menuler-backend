import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQrcodeInput } from '../dto/CreateQrcodeInput';
import { QrcodeService } from '../qrcode.service';
import { qrcodeStub } from '../stubs/qrcode.stub';

describe('QrcodeService', () => {
  let qrcodeService: QrcodeService;
  const tableDetail: CreateQrcodeInput = {
    restaurantId: qrcodeStub().restaurantId,
    tableName: qrcodeStub().tableName,
  };
  const qrcodeResult = {
    ...qrcodeStub(),
    id: expect.any(String),
    tableToken: expect.any(String),
    qrcodeImageUrl: expect.any(String),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrcodeService, PrismaService],
    }).compile();

    qrcodeService = module.get<QrcodeService>(QrcodeService);
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
    } catch (error) {}
  });
  it('should be defined', () => {
    expect(qrcodeService).toBeDefined();
  });

  describe('generateQrcode', () => {
    it('should generate qrcode', async () => {
      const qrcode = await qrcodeService.generateQrcode(tableDetail);
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
      const { tableToken } = await qrcodeService.generateQrcode(tableDetail);
      const qrcode = await qrcodeService.findQrcodeByTableToken(tableToken);
      expect(qrcode).toEqual(qrcodeResult);
    });
    it('should throw not found exception', async () => {
      try {
        await qrcodeService.findQrcodeByTableToken('something');
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });
  });
});
