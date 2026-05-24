import { BaseException } from './base.exception';

export class FieldIsRequiredException extends BaseException {
  constructor(field: string) {
    super(`Field ${field} is required`);
  }
}
