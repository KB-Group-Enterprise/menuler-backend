import { BadRequestException, PipeTransform } from '@nestjs/common';
import { FileValidatorOption } from '../types/file-validator-option.type';

export class FileValidatorPipe implements PipeTransform {
  private option: FileValidatorOption = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    extension: ['jpg', 'png', 'jpeg'],
  };
  constructor(option?: FileValidatorOption) {
    this.option = {
      ...this.option,
      ...option,
    };
  }

  addFileSizeValidator(file: Express.Multer.File) {
    const isFileSizePassed = file.size < this.option.maxFileSize; // byte
    if (!isFileSizePassed)
      throw new BadRequestException('File size should less than 5MB');
    return isFileSizePassed;
  }

  addFileExtensionValidator(file: Express.Multer.File) {
    const extension = this.option.extension.join('|');
    const fileExtensionRegex = new RegExp(`\.(${extension})$`);
    const isFileExtensionPassed = fileExtensionRegex.test(file.originalname);
    if (!isFileExtensionPassed)
      throw new BadRequestException(`File extension should be ${extension}`);
    return isFileExtensionPassed;
  }

  transform(file: Express.Multer.File) {
    console.log(this.option);
    if (this.option.extension) {
      this.addFileExtensionValidator(file);
    }
    if (this.option.maxFileSize) {
      this.addFileSizeValidator(file);
    }
    return file;
  }

  build() {
    return this;
  }
}
