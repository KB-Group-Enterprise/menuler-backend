// import { Test, TestingModule } from '@nestjs/testing';
// import { Response } from 'express';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { QrcodeController } from '../qrcode.controller';
// import { QrcodeService } from '../qrcode.service';
// import { qrcodeStub } from '../stubs/qrcode.stub';

// jest.mock('../qrcode.service');

// describe('QrcodeController', () => {
//   const responseMock = {
//     json: jest.fn((x) => x),
//   } as unknown as Response;
//   let qrcodeController: QrcodeController;
//   let qrcodeService: QrcodeService;
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [QrcodeController],
//       providers: [QrcodeService],
//     }).compile();

//     qrcodeController = module.get<QrcodeController>(QrcodeController);
//     qrcodeService = module.get<QrcodeService>(QrcodeService);
//   });

//   it('should be defined', () => {
//     expect(qrcodeController).toBeDefined();
//   });

//   describe('getTable', () => {
//     describe('when getTable is called', () => {
//       beforeEach(() => {
//         jest
//           .spyOn(qrcodeService, 'generateQrcode')
//           .mockResolvedValue(qrcodeStub());
//         jest
//           .spyOn(qrcodeService, 'findQrcodeByTableToken')
//           .mockResolvedValue(qrcodeStub());
//       });
//       it('should return table', async () => {
//         expect(
//           await qrcodeController.getTable(
//             qrcodeStub().tableToken,
//             responseMock,
//           ),
//         ).toStrictEqual(qrcodeStub());
//       });
//     });
//   });
// });
it.todo('controller');
