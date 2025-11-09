import { Injectable, BadRequestException } from '@nestjs/common';
import { file } from 'googleapis/build/src/apis/file';
import { Multer } from 'multer';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일을 로드

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor() {
    // 필수 환경 변수 검증
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID is not defined');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY is not defined');
    }
    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION is not defined');
    }
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS_BUCKET_NAME is not defined');
    }

    this.bucketName = process.env.AWS_BUCKET_NAME;

    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  // S3 파일 업로드
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      file.originalname = Buffer.from(file.originalname, 'ascii').toString(
        'utf-8',
      );
      const fileKey = `${uuidv4()}-${file.originalname}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ACL: ObjectCannedACL.public_read,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await this.s3.send(command);

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      if (error instanceof S3ServiceException) {
        switch (error.name) {
          case 'InvalidAccessKeyId':
            throw new BadRequestException('Invalid AWS Access Key ID');
          case 'SignatureDoesNotMatch':
            throw new BadRequestException('Invalid AWS Secret Access Key');
          case 'NoSuchBucket':
            throw new BadRequestException('S3 bucket does not exist');
          default:
            throw new BadRequestException(`S3 upload failed: ${error.message}`);
        }
      }
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

// S3 파일 삭제
async deleteFile(fileUrl: string): Promise<void> {
  try {
    // URL에서 파일 키 추출
    const urlParts = fileUrl.split("/");
    const fileKey = urlParts[urlParts.length - 1];

    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(params);
    await this.s3.send(command);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
  


}
