<<<<<<< HEAD
import { Injectable, UploadedFile } from "@nestjs/common";
import { file } from "googleapis/build/src/apis/file";
import { Multer } from "multer";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
=======
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

>>>>>>> origin/main

dotenv.config(); // .env 파일을 로드

@Injectable()
export class S3Service {
<<<<<<< HEAD
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
    // file = 컨트롤러에서 받아온 파일
    file.originalname = Buffer.from(file.originalname, "ascii").toString(
      "utf-8" // 깨지지 않게 utf-8로 변환해준다
=======
    private readonly s3: S3Client
    private readonly bucketName: string = process.env.AWS_BUCKET_NAME
    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        })
    }
// S3 파일 업로드 
async uploadFile(file: Express.Multer.File): Promise<string> {
  // file = 컨트롤러에서 받아온 파일 
    file.originalname = Buffer.from(file.originalname, 'ascii').toString(
      'utf-8', // 깨지지 않게 utf-8로 변환해준다
>>>>>>> origin/main
    );
    const fileKey = `${uuidv4()}-${file.originalname}`; // 파일이름생성
    const params = {
      // S3 업로드 파라미터 설정
      Bucket: this.bucketName, // 버킷이름
      Key: fileKey, //S3에 저장될 파일의 이름
      Body: file.buffer, //업로드할 파일의 내용
      ACL: ObjectCannedACL.public_read, // 파일 접근권한
      ContentType: file.mimetype, //Multer로 업로드된 파일 MIME타입(jpg,pdf 등) 자동설정
    };

    const command = new PutObjectCommand(params); //파라미터 설정을 토대로 파일 업로드

    try {
      await this.s3.send(command); // 파일 업로드 실행
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`; //업로드 된 파일 경로 return
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
<<<<<<< HEAD

  // 여러 파일 동시 업로드
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
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
=======
>>>>>>> origin/main
}
