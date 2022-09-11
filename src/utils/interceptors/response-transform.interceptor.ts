import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { blackListFields } from '../black-list-fields';

export interface Response<T> {
  statusCode: number;
  data: T;
}

@Injectable()
export class ResponseTransform<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        this.removeSensitiveFields(data);
        return {
          isSuccess: true,
          statusCode: 200,
          ...data,
        };
      }),
    );
  }

  private removeSensitiveFields(data: any) {
    const baseData = data?.data;
    if (!baseData) return;
    if (Array.isArray(baseData)) {
      for (const dataInArr of baseData) {
        for (const field of blackListFields) {
          if (Object.keys(dataInArr).includes(field)) delete baseData[field];
        }
      }
    } else {
      for (const field of blackListFields) {
        if (Object.keys(baseData).includes(field)) delete baseData[field];
      }
    }
  }
}
