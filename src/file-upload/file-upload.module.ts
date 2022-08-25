import { DynamicModule, Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';

@Module({})
export class FileUploadModule {
  static forRoot(entities = [], options?): DynamicModule {
    return {
      global: true,
      module: FileUploadModule,
      providers: [FileUploadService],
      exports: [FileUploadService],
      controllers: [FileUploadController],
    };
  }
}
