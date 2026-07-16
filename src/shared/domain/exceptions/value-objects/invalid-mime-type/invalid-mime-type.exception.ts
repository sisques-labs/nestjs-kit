import { BaseException } from '@/shared/domain/exceptions/base.exception';

/**
 * Invalid MIME Type Exception
 * This exception is thrown when a MIME type value is invalid.
 */
export class InvalidMimeTypeException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}
