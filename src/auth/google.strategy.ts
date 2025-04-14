import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validateGoogleUser(accessToken: string) {
    console.log(
      'Validating Google access token:',
      accessToken?.substring(0, 10) + '...',
    );

    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      console.log('Google API response:', JSON.stringify(response.data));

      return {
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        accessToken,
      };
    } catch (error) {
      console.error(
        'Google validation error:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Invalid Google access token');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
