import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
<<<<<<< HEAD
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { ApiOperation, ApiBody, ApiTags, ApiResponse } from "@nestjs/swagger";
import { Public } from "src/decorator/public.decorator";

@Controller("auth")
@ApiTags("인증")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("test-login")
  @Public()
  @ApiOperation({
    summary: "테스트용 로그인",
    description: "개발 환경에서만 사용하는 테스트용 로그인입니다.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          example: "test@example.com",
          description: "테스트용 이메일",
        },
      },
      required: ["email"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "토큰 발급 성공",
    schema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          description: "JWT 토큰",
        },
      },
    },
  })
  async testLogin(@Body() body: { email: string }) {
    return this.authService.createTestToken(body.email);
  }
=======
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
>>>>>>> origin/main
}
