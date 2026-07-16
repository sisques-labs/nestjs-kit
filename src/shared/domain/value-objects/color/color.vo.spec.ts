import { InvalidColorException } from '@/shared/domain/exceptions/value-objects/invalid-color/invalid-color.exception';
import { ColorValueObject } from '@/shared/domain/value-objects/color/color.vo';

describe('ColorValueObject', () => {
  describe('constructor', () => {
    it('should create a color value object with hex color', () => {
      const color = new ColorValueObject('#ffffff');

      expect(color.value).toBe('#ffffff');
    });

    it('should create a color value object with RGB color', () => {
      const color = new ColorValueObject('rgb(255, 255, 255)');

      expect(color.value).toBe('rgb(255, 255, 255)');
    });

    it('should create a color value object with HSL color', () => {
      const color = new ColorValueObject('hsl(0, 0%, 100%)');

      expect(color.value).toBe('hsl(0, 0%, 100%)');
    });

    it('should create a color value object with named color', () => {
      const color = new ColorValueObject('red');

      expect(color.value).toBe('red');
    });

    it('should normalize color to lowercase', () => {
      const color = new ColorValueObject('RED');

      expect(color.value).toBe('red');
    });

    it('should throw InvalidColorException for empty string', () => {
      expect(() => new ColorValueObject('')).toThrow(InvalidColorException);
    });

    it('should throw InvalidColorException for null or undefined value', () => {
      expect(() => new ColorValueObject(null as any)).toThrow(
        InvalidColorException,
      );
      expect(() => new ColorValueObject(undefined as any)).toThrow(
        InvalidColorException,
      );
    });

    it('should throw InvalidColorException for invalid color format', () => {
      expect(() => new ColorValueObject('invalid')).toThrow(
        InvalidColorException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal colors', () => {
      const color1 = new ColorValueObject('#ffffff');
      const color2 = new ColorValueObject('#ffffff');

      expect(color1.equals(color2)).toBe(true);
    });

    it('should return false for different colors', () => {
      const color1 = new ColorValueObject('#ffffff');
      const color2 = new ColorValueObject('#000000');

      expect(color1.equals(color2)).toBe(false);
    });
  });

  describe('format checks', () => {
    it('should check if color is hex format', () => {
      expect(new ColorValueObject('#ffffff').isHex()).toBe(true);
      expect(new ColorValueObject('rgb(255, 255, 255)').isHex()).toBe(false);
    });

    it('should check if color is RGB format', () => {
      expect(new ColorValueObject('rgb(255, 255, 255)').isRgb()).toBe(true);
      expect(new ColorValueObject('#ffffff').isRgb()).toBe(false);
    });

    it('should check if color is HSL format', () => {
      expect(new ColorValueObject('hsl(0, 0%, 100%)').isHsl()).toBe(true);
      expect(new ColorValueObject('#ffffff').isHsl()).toBe(false);
    });
  });

  describe('conversion methods', () => {
    it('should convert hex to hex (no change)', () => {
      const color = new ColorValueObject('#ffffff');

      expect(color.toHex()).toBe('#ffffff');
    });

    it('should convert RGB to hex', () => {
      const color = new ColorValueObject('rgb(255, 255, 255)');

      expect(color.toHex()).toBeDefined();
    });

    it('should convert hex to RGB', () => {
      const color = new ColorValueObject('#ffffff');

      expect(color.toRgb()).toBeDefined();
    });

    it('should return the RGB value unchanged when already RGB', () => {
      expect(new ColorValueObject('rgb(255, 255, 255)').toRgb()).toBe(
        'rgb(255, 255, 255)',
      );
    });

    it('should compute the exact RGB values from hex', () => {
      expect(new ColorValueObject('#ff00ff').toRgb()).toBe('rgb(255, 0, 255)');
      expect(new ColorValueObject('#000000').toRgb()).toBe('rgb(0, 0, 0)');
    });

    it('should compute the exact hex value from RGB', () => {
      expect(new ColorValueObject('rgb(255, 0, 255)').toHex()).toBe('#ff00ff');
      expect(new ColorValueObject('rgb(0, 0, 0)').toHex()).toBe('#000000');
    });

    it('should fall back to the original value when RGB cannot be parsed for hex conversion', () => {
      const color = new ColorValueObject('rgb( 255, 255, 255)');

      expect(color.isRgb()).toBe(true);
      expect(color.toHex()).toBe('rgb( 255, 255, 255)');
    });

    it('should return the value unchanged for hsl-to-hex and hsl-to-rgb stubs', () => {
      const color = new ColorValueObject('hsl(0, 0%, 100%)');

      expect(color.toHex()).toBe('hsl(0, 0%, 100%)');
      expect(color.toRgb()).toBe('hsl(0, 0%, 100%)');
    });

    it('should return the value unchanged for hex-to-hsl and rgb-to-hsl stubs', () => {
      expect(new ColorValueObject('#ffffff').toHsl()).toBe('#ffffff');
      expect(new ColorValueObject('rgb(255, 255, 255)').toHsl()).toBe(
        'rgb(255, 255, 255)',
      );
    });

    it('should return the HSL value unchanged when already HSL', () => {
      expect(new ColorValueObject('hsl(0, 0%, 100%)').toHsl()).toBe(
        'hsl(0, 0%, 100%)',
      );
    });

    it('should return a named color unchanged from all conversion methods', () => {
      const color = new ColorValueObject('red');

      expect(color.toHex()).toBe('red');
      expect(color.toRgb()).toBe('red');
      expect(color.toHsl()).toBe('red');
    });

    it('should accept all supported named colors', () => {
      const namedColors = [
        'red',
        'green',
        'blue',
        'yellow',
        'orange',
        'purple',
        'pink',
        'black',
        'white',
        'gray',
        'grey',
        'brown',
        'cyan',
        'magenta',
      ];

      namedColors.forEach((name) => {
        expect(() => new ColorValueObject(name)).not.toThrow();
      });
    });
  });
});
