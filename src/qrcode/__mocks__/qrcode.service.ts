import { qrcodeStub } from '../stubs/qrcode.stub';

export const QrcodeService = jest.fn().mockReturnValue({
  findQrcodeByTableToken: jest.fn().mockResolvedValue(qrcodeStub()),
  generateQrcode: jest.fn().mockResolvedValue(qrcodeStub()),
});
