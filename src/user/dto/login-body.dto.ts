import { ApiProperty } from '@nestjs/swagger';

export class LoginBodyDto {
  @ApiProperty({ description: 'OAuth 액세스 토큰', example: 'your_access_token' })
  access_token: string;
}
