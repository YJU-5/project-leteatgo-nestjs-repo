import { Injectable, UploadedFile } from '@nestjs/common';
import { file } from 'googleapis/build/src/apis/file';
import { Multer } from 'multer';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일을 로드

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string = process.env.AWS_BUCKET_NAME;
  constructor() {
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
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
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

    try {
      await this.s3.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // S3 파일 삭제
  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
