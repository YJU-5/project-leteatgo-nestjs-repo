<<<<<<< HEAD
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
=======
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
>>>>>>> origin/main
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

<<<<<<< HEAD
  it("should be defined", () => {
=======
  it('should be defined', () => {
>>>>>>> origin/main
    expect(service).toBeDefined();
  });
});
