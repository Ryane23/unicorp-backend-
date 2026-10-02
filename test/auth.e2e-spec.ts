import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Add prefix to match main.ts configuration.
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
    
    // Clean up database before tests (using pluralized delegate)
    await prisma.users.deleteMany({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({ where: { email: 'test@example.com' } });
    await app.close();
  });

  const testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'SecurePassword123!',
    username: 'testuser',
  };

  it('/auth/register (POST) - should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
        expect(res.body.data.expiresIn).toBe('15m');
        expect(res.body.data.roles).toContain('STUDENT');
      });
  });

  it('/auth/login (POST) - should login with registered user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
      });
  });

  it('/auth/me (GET) - should get current user profile', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.data.accessToken;

    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.email).toBe(testUser.email);
        expect(res.body.data.firstName).toBe('Test');
        expect(res.body.data.lastName).toBe('User');
      });
  });

  it('/auth/login (POST) - should fail with wrong password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      })
      .expect(401);
  });
});
