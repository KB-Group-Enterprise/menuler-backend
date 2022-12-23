import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3_FOLDER } from './enum/s3-folder.enum';
import { FileUploadService } from './file-upload.service';
import { FileValidatorPipe } from './pipe/file-validator.pipe';
import { TestDto } from './test.dto';

@Controller('file')
export class FileUploadController {
  constructor(private readonly uploadService: FileUploadService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(new FileValidatorPipe())
    files: Express.Multer.File[],
    @Body() body: TestDto,
  ) {
    const uploaded = await this.uploadService.uploadS3(
      files,
      S3_FOLDER.RESTAURANT,
    );
    console.log(uploaded);
    console.log(body);
  }
}
