/**
 * Finds the longest pattern in a source string that matches a given pattern.
 * The function splits the pattern into prefix and suffix around '*' and
 * finds the best match in the source string.
 * 
 * @param sourceString - The string to search in
 * @param pattern - The pattern to search for, with '*' as wildcard
 * @returns The maximum length of matching text
 */
export function findLongestPattern(sourceString: string, pattern: string): number {
  // Handle edge cases
  if (sourceString.length === 0) return 0;
  if (pattern === '*') return sourceString.length;
  
  // Split pattern into prefix and suffix around '*'
  const star_index = pattern.indexOf('*');
  
  // Handle case where there's no star in the pattern
  if (star_index === -1) {
    return sourceString === pattern ? pattern.length : 0;
  }
  
  const prefix = pattern.slice(0, star_index);
  const suffix = pattern.slice(star_index + 1);
  
  let max_len = 0;
  
  // Try every possible starting point for prefix
  for (let i = 0; i <= sourceString.length; i++) {
    // Check if prefix fits
    if (i + prefix.length <= sourceString.length && 
        (prefix.length === 0 || sourceString.substring(i, i + prefix.length) === prefix)) {
      // Find the farthest j where suffix fits
      for (let j = i + prefix.length; j <= sourceString.length; j++) {
        // Check if substring from i to j ends with suffix
        if (suffix.length === 0 || 
            (j - suffix.length >= i && sourceString.substring(j - suffix.length, j) === suffix)) {
          max_len = Math.max(max_len, j - i);
        }
      }
    }
  }
  
  return max_len;
}

// The range function is no longer needed as we're using standard for loops