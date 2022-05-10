import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminService } from '../../admin/admin.service';
import { AuthService } from '../auth.service';
import { RegisterAdminInput } from '../dto/RegisterAdmin.dto';
import { adminStub } from './stubs/admin.stub';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let adminService: AdminService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        AdminService,
        ConfigService,
        PrismaService,
        JwtStrategy,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    adminService = module.get(AdminService);
  });
  afterEach(async () => {
    try {
      await adminService.deleteAdminByEmail(adminStub().email);
    } catch (error) {}
  });
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  const registerInput: RegisterAdminInput = {
    email: adminStub().email,
    password: adminStub().password,
  };

  describe('registerAdmin', () => {
    let tempAccessToken: string;

    it('should return accessToken and admin', async () => {
      const { accessToken, admin } = await authService.registerAdmin(
        registerInput,
      );
      tempAccessToken = accessToken;
      expect(tempAccessToken).toBeDefined();
      expect(admin).toBeDefined();

      const verifiedPayload: { sub: string; email: string } = jwtService.verify(
        tempAccessToken,
        { secret: process.env.JWT_ACCESS_SECRET },
      );
      expect(verifiedPayload.sub).toBe(admin.id);
      expect(verifiedPayload.email).toBe(admin.email);

      expect(admin).toEqual({
        password: expect.any(String),
        restaurantId: null,
        id: expect.any(String),
        email: adminStub().email,
      });
    });

    it('should throw invalid signature', () => {
      try {
        jwtService.verify(tempAccessToken, {
          secret: 'wrong secret',
        });
      } catch (error) {
        expect(error.message).toBe('invalid signature');
      }
    });

    it('should throw conflict error', async () => {
      try {
        await adminService.createAdmin(registerInput);
        await adminService.createAdmin(registerInput);
      } catch (error) {
        expect(error.status).toBe(409);
      }
    });
  });
  describe('loginAdmin', () => {
    const loginInput: RegisterAdminInput = {
      email: adminStub().email,
      password: adminStub().password,
    };
    let tempAccessToken: string;
    it('should return accessToken', async () => {
      const admin = await adminService.createAdmin(registerInput);
      const { accessToken } = await authService.loginAdmin(loginInput);
      expect(accessToken).toBeDefined();

      tempAccessToken = accessToken;
      const verifiedPayload: { sub: string; email: string } = jwtService.verify(
        tempAccessToken,
        { secret: process.env.JWT_ACCESS_SECRET },
      );
      expect(verifiedPayload.sub).toBe(admin.id);
      expect(verifiedPayload.email).toBe(admin.email);
    });

    it('should throw invalid signature', () => {
      try {
        jwtService.verify(tempAccessToken, {
          secret: 'wrong secret',
        });
      } catch (error) {
        expect(error.message).toBe('invalid signature');
      }
    });

    it('should throw notfound exception', async () => {
      try {
        await authService.loginAdmin({
          email: 'wrong@email.com',
          password: '123456680',
        });
      } catch (error) {
        expect(error.status).toBe(404);
      }
    });

    it('should throw unauthorized exception', async () => {
      try {
        await authService.registerAdmin(registerInput);
        await authService.loginAdmin({
          ...loginInput,
          password: '111111111111',
        });
      } catch (error) {
        expect(error.status).toBe(401);
      }
    });
  });
});
