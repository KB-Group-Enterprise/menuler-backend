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
      region: process.env.S3_REGION,
    });
  }

  async uploadS3(
    files: Express.Multer.File[],
    folder: S3_FOLDER,
  ): Promise<S3.ManagedUpload.SendData[]> {
    if (!files?.length) return [];
    const filesPromises = files.map(
      (file): Promise<S3.ManagedUpload.SendData> => {
        const fileExtention = file.originalname.match(/\.(.*)/)[0];
        const bucketS3 = process.env.S3_BUCKET_ID;
        const params: S3.PutObjectRequest = {
          Bucket: bucketS3,
          Key: `${folder}/${folder}-${Date.now()}${fileExtention}`,
          Body: file.buffer,
          ACL: 'public-read',
        };
        return new Promise((resolve, reject) => {
          this.s3.upload(params, (err, data: S3.ManagedUpload.SendData) => {
            if (err) {
              return reject(err.message);
            }
            resolve(data);
          });
        });
      },
    );
    const uploadedFiles = await Promise.all([...filesPromises]);
    return uploadedFiles;
  }
}
