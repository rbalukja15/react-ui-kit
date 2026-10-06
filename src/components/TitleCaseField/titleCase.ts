/**
 * Title-cases a short, name-like value: a person, a project, a city.
 *
 * The rules are deliberately simple:
 *
 * - Whitespace at the edges is trimmed, and every internal run of whitespace
 *   (spaces, tabs, line breaks, non-breaking spaces) becomes a single space.
 * - The first character of each word is uppercased. Nothing is ever
 *   lowercased, so casing the user typed on purpose (`McDonald`, `NASA`)
 *   survives.
 * - Only whitespace separates words. A hyphen or an apostrophe does not start
 *   a new word, so `jean-luc` becomes `Jean-luc` and `o'neil` becomes
 *   `O'neil`; a capital typed after one is kept, so `Jean-Luc` stays as is.
 *   This keeps compounds such as `X-ray` from turning into `X-Ray`.
 * - A word that starts with something other than a letter is left alone, so
 *   `2nd` stays `2nd` and `(draft)` stays `(draft)`.
 * - Empty or whitespace-only input returns `''`.
 *
 * Uppercasing uses `toLocaleUpperCase(locale)`, so pass a locale when the
 * language has its own rules: `titleCase('istanbul', 'tr')` gives `İstanbul`.
 * Without one, the runtime's default locale is used. A letter whose uppercase
 * form is two letters expands (`ß` becomes `SS`), as `toLocaleUpperCase` does.
 *
 * It ships in a `'use client'` bundle, so in the Next.js App Router call it
 * from client code: a server component, route handler or server action that
 * calls it fails at runtime.
 *
 * @param value The text to clean up.
 * @param locale A BCP 47 language tag (or a list of them, in order of
 *   preference) used to uppercase the first letters. An invalid tag throws a
 *   `RangeError`, as `toLocaleUpperCase` does.
 * @returns The cleaned value.
 */
export function titleCase(value: string, locale?: string | string[]): string {
  // Guards plain-JS callers that pass null or undefined.
  if (!value) return '';
  return (
    value
      .trim()
      .split(/\s+/)
      // `u` makes `.` match a whole code point, so a letter outside the Basic
      // Multilingual Plane is uppercased instead of being split in half.
      .map((word) => word.replace(/^./u, (first) => first.toLocaleUpperCase(locale)))
      .join(' ')
  );
}
