import { BaseException } from '@/shared/domain/exceptions/base.exception';

export class InvalidVectorException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}
