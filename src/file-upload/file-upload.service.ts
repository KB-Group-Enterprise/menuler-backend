import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { S3_FOLDER } from './enum/s3-folder.enum';

@Injectable()
export class FileUploadService {
  s3: S3;
  logger = new Logger('FileUploadS3');

  constructor() {
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
  }

  async uploadS3(
    file: Express.Multer.File,
    folder: S3_FOLDER,
  ): Promise<S3.ManagedUpload.SendData> {
    const bucketS3 = 'akira-aws';
    const params: S3.PutObjectRequest = {
      Bucket: bucketS3,
      Key: `${folder}/${folder}-${Date.now()}`,
      Body: file.buffer,
      //   ACL: 'public-read',
    };
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          return reject(err.message);
        }
        resolve(data);
      });
    });
  }
}
