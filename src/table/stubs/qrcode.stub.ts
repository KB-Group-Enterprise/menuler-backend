import { Table } from '@prisma/client';

export const qrcodeStub = (): Table => ({
  id: '6274f93be9797cc34d0ec077',
  tableToken: '8a8fb351-d9d3-4e5a-b659-d0ffe0f766ae',
  tableName: 'AAAAZZZ',
  qrcodeImageUrl:
    'http://api.qrserver.com/v1/create-qr-code/?data=http://localhost:3000/8a8fb351-d9d3-4e5a-b659-d0ffe0f766ae!&size=100x100',
  isActivate: true,
  restaurantId: '627100646e64e68312ef5833',
});
