import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
  S3ServiceException,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region) {
      throw new Error('AWS_REGION is not defined');
    }
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME is not defined');
    }

    this.bucketName = bucketName;

    const config: S3ClientConfig = { region };
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (accessKeyId && secretAccessKey) {
      config.credentials = { accessKeyId, secretAccessKey };
    }

    this.s3 = new S3Client(config);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const originalName = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );
      const fileKey = `${randomUUID()}-${originalName}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ACL: ObjectCannedACL.public_read,
          ContentType: file.mimetype,
        }),
      );

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

      const message =
        error instanceof Error ? error.message : 'Unknown upload error';
      throw new BadRequestException(`File upload failed: ${message}`);
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    if (files.length > 4) {
      throw new BadRequestException('A maximum of four images can be uploaded.');
    }

    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const pathname = new URL(fileUrl).pathname;
      const fileKey = decodeURIComponent(pathname.replace(/^\//, ''));

      if (!fileKey) {
        throw new Error('The file URL does not contain an object key');
      }

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown deletion error';
      throw new Error(`Failed to delete file: ${message}`);
    }
  }
}
