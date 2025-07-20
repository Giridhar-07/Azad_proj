import { findLongestPattern } from './patternFinder';

describe('findLongestPattern', () => {
  test('finds pattern with star in the middle', () => {
    expect(findLongestPattern('abcdefg', 'abc*fg')).toBe(7); // matches 'abcdefg'
    expect(findLongestPattern('abcdefg', 'abc*g')).toBe(7);  // matches 'abcdefg'
    expect(findLongestPattern('abcdefg', 'a*g')).toBe(7);    // matches 'abcdefg'
  });

  test('finds pattern with star at the beginning', () => {
    expect(findLongestPattern('abcdefg', '*defg')).toBe(7);  // matches 'abcdefg'
    expect(findLongestPattern('abcdefg', '*fg')).toBe(7);    // matches 'abcdefg'
    expect(findLongestPattern('abcdefg', '*g')).toBe(7);     // matches 'abcdefg'
  });

  test('finds pattern with star at the end', () => {
    expect(findLongestPattern('abcdefg', 'abc*')).toBe(7);   // matches 'abcdefg'
    expect(findLongestPattern('abcdefg', 'a*')).toBe(7);     // matches 'abcdefg'
  });

  test('handles multiple possible matches', () => {
    expect(findLongestPattern('abcabcabc', 'a*c')).toBe(9);  // matches the whole string
    expect(findLongestPattern('abcdefabc', 'a*c')).toBe(9);  // matches the whole string
  });

  test('returns 0 when no match is found', () => {
    expect(findLongestPattern('abcdefg', 'xyz*abc')).toBe(0);
    expect(findLongestPattern('abcdefg', 'def*xyz')).toBe(0);
  });

  test('handles empty strings', () => {
    expect(findLongestPattern('', 'a*b')).toBe(0);
    expect(findLongestPattern('abcdefg', '*')).toBe(7);  // star alone matches everything
    expect(findLongestPattern('', '*')).toBe(0);         // nothing to match
  });
});