import { IsArray, IsNotEmpty, IsObject } from 'class-validator';
import { Table } from '../interfaces/table';

export class CreateTableRequest {
  @IsNotEmpty()
  @IsArray()
  tables: Table[];
}
