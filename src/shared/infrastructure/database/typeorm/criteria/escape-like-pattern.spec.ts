import { escapeLikePattern } from './escape-like-pattern';

describe('escapeLikePattern', () => {
  it('leaves plain text untouched', () => {
    expect(escapeLikePattern('ros')).toBe('ros');
  });

  it('escapes the percent wildcard', () => {
    expect(escapeLikePattern('50%')).toBe('50\\%');
  });

  it('escapes the underscore wildcard', () => {
    expect(escapeLikePattern('a_b')).toBe('a\\_b');
  });

  it('escapes the backslash escape character itself', () => {
    expect(escapeLikePattern('c:\\x')).toBe('c:\\\\x');
  });

  it('escapes every special character in a mixed value', () => {
    expect(escapeLikePattern('100%_\\done')).toBe('100\\%\\_\\\\done');
  });

  it('returns an empty string for an empty value', () => {
    expect(escapeLikePattern('')).toBe('');
  });
});
