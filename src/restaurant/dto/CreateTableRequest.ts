import { IsNotEmpty } from 'class-validator';
import { Table } from '../interfaces/table';

export class CreateTableRequest {
  @IsNotEmpty()
  tables: Table[];
}
