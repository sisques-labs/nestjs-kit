import { InvalidFilenameException } from '@/shared/domain/exceptions/value-objects/invalid-filename/invalid-filename.exception';
import { ValueObject } from '@/shared/domain/value-objects/base/value-object.base';

/**
 * Filename Value Object
 * This value object is responsible for encapsulating an uploaded file's
 * original filename. It rejects path separators and control characters
 * (including null bytes) to guard against path traversal, but otherwise
 * makes no assumption about extension or character set.
 * @param value - The filename.
 * @returns A new instance of the FilenameValueObject.
 */
export class FilenameValueObject extends ValueObject<string> {
  private static readonly MAX_LENGTH = 255;
  // eslint-disable-next-line no-control-regex
  private static readonly FORBIDDEN_CHARS_PATTERN = /[/\\\x00-\x1f]/;

  private readonly _value: string;

  constructor(value: string) {
    super();
    this._value = (value ?? '').trim();
    this.validate();
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: FilenameValueObject): boolean {
    return this._value === other._value;
  }

  /**
   * Gets the file extension (without the dot), lowercased. Empty string if none.
   * @returns The file extension
   */
  public getExtension(): string {
    const lastDot = this._value.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === this._value.length - 1) {
      return '';
    }
    return this._value.slice(lastDot + 1).toLowerCase();
  }

  protected validate(): void {
    if (this._value.length === 0) {
      throw new InvalidFilenameException('Filename cannot be empty');
    }

    if (this._value.length > FilenameValueObject.MAX_LENGTH) {
      throw new InvalidFilenameException(
        `Filename is too long (max ${FilenameValueObject.MAX_LENGTH} characters)`,
      );
    }

    if (this._value === '.' || this._value === '..') {
      throw new InvalidFilenameException('Filename cannot be "." or ".."');
    }

    if (FilenameValueObject.FORBIDDEN_CHARS_PATTERN.test(this._value)) {
      throw new InvalidFilenameException(
        'Filename cannot contain path separators or control characters',
      );
    }
  }
}
