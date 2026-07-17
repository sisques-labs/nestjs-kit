import { InvalidMimeTypeException } from '@/shared/domain/exceptions/value-objects/invalid-mime-type/invalid-mime-type.exception';
import { ValueObject } from '@/shared/domain/value-objects/base/value-object.base';

/**
 * MIME Type Value Object
 * This value object is responsible for encapsulating IANA media type strings
 * (e.g. `image/png`, `application/pdf`). It ensures the value has the
 * `type/subtype` structure and normalizes it to lowercase, since MIME types
 * are conventionally case-insensitive for the type and subtype.
 * @param value - The MIME type string.
 * @returns A new instance of the MimeTypeValueObject.
 */
export class MimeTypeValueObject extends ValueObject<string> {
  private static readonly MAX_LENGTH = 255;
  private static readonly MIME_TYPE_PATTERN =
    /^[a-zA-Z0-9][\w!#$&\-^.+]*\/[a-zA-Z0-9][\w!#$&\-^.+]*$/;

  private readonly _value: string;

  constructor(value: string) {
    super();
    this._value = (value ?? '').trim().toLowerCase();
    this.validate();
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: MimeTypeValueObject): boolean {
    return this._value === other._value;
  }

  /**
   * Gets the top-level type (before the slash), e.g. "image" for "image/png"
   * @returns The MIME type's type part
   */
  public getType(): string {
    return this._value.split('/')[0];
  }

  /**
   * Gets the subtype (after the slash), e.g. "png" for "image/png"
   * @returns The MIME type's subtype part
   */
  public getSubtype(): string {
    return this._value.split('/')[1];
  }

  protected validate(): void {
    if (this._value.length === 0) {
      throw new InvalidMimeTypeException('MIME type cannot be empty');
    }

    if (this._value.length > MimeTypeValueObject.MAX_LENGTH) {
      throw new InvalidMimeTypeException(
        `MIME type is too long (max ${MimeTypeValueObject.MAX_LENGTH} characters)`,
      );
    }

    if (!MimeTypeValueObject.MIME_TYPE_PATTERN.test(this._value)) {
      throw new InvalidMimeTypeException(
        'MIME type must have the form "type/subtype" (e.g. "image/png")',
      );
    }
  }
}
