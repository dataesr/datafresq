import { describe, expect, it } from 'bun:test';
import { escapeRegex } from '~/utils/strings';

describe('escapeRegex', () => {
  it('escapes dots', () => {
    expect(escapeRegex('test.com')).toBe('test\\.com');
  });

  it('escapes asterisks', () => {
    expect(escapeRegex('test*')).toBe('test\\*');
  });

  it('escapes plus signs', () => {
    expect(escapeRegex('test+user')).toBe('test\\+user');
  });

  it('escapes question marks', () => {
    expect(escapeRegex('test?')).toBe('test\\?');
  });

  it('escapes caret', () => {
    expect(escapeRegex('^start')).toBe('\\^start');
  });

  it('escapes dollar sign', () => {
    expect(escapeRegex('end$')).toBe('end\\$');
  });

  it('escapes curly braces', () => {
    expect(escapeRegex('a{2,3}')).toBe('a\\{2,3\\}');
  });

  it('escapes parentheses', () => {
    expect(escapeRegex('(group)')).toBe('\\(group\\)');
  });

  it('escapes pipe', () => {
    expect(escapeRegex('a|b')).toBe('a\\|b');
  });

  it('escapes square brackets', () => {
    expect(escapeRegex('[abc]')).toBe('\\[abc\\]');
  });

  it('escapes backslash', () => {
    expect(escapeRegex('path\\to')).toBe('path\\\\to');
  });

  it('escapes multiple special characters at once', () => {
    expect(escapeRegex('user+tag@example.com')).toBe('user\\+tag@example\\.com');
  });

  it('returns plain strings unchanged', () => {
    expect(escapeRegex('hello')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(escapeRegex('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(escapeRegex('.*+')).toBe('\\.\\*\\+');
  });

  it('produces a string safe for use in RegExp constructor', () => {
    const input = 'test+user@example.com';
    const escaped = escapeRegex(input);
    const regex = new RegExp(escaped);
    expect(regex.test(input)).toBe(true);
    expect(regex.test('testXuser@exampleXcom')).toBe(false);
  });
});
