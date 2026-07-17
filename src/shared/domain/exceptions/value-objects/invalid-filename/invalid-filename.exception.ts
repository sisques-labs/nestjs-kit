import { BaseException } from '@/shared/domain/exceptions/base.exception';

/**
 * Invalid Filename Exception
 * This exception is thrown when a filename value is invalid.
 */
export class InvalidFilenameException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}
