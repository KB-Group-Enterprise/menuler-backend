import { EVENT_TYPE } from '../../utils/enums/event-type.enum';

export interface CustomWsResponse extends Record<string, any> {
  message: string;
  type: EVENT_TYPE;
}
