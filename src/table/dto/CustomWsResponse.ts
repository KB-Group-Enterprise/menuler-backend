import { EVENT_TYPE } from '../enums/event-type.enum';

export interface CustomWsResponse extends Record<string, any> {
  message: string;
  type: EVENT_TYPE;
}
