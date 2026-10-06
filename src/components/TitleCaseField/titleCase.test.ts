import { titleCase } from './titleCase';

describe('titleCase', () => {
  describe('empty input', () => {
    it.each([
      ['an empty string', ''],
      ['spaces only', '   '],
      ['tabs and line breaks only', '\t\n\r\n '],
    ])('returns an empty string for %s', (_, input) => {
      expect(titleCase(input)).toBe('');
    });

    it('returns an empty string for null or undefined from plain-JS callers', () => {
      expect(titleCase(null as unknown as string)).toBe('');
      expect(titleCase(undefined as unknown as string)).toBe('');
    });
  });

  describe('whitespace', () => {
    it('uppercases the first letter of each word', () => {
      expect(titleCase('jane doe')).toBe('Jane Doe');
    });

    it('trims the edges and collapses runs of spaces', () => {
      expect(titleCase('   jane    doe  ')).toBe('Jane Doe');
    });

    it('turns tabs and line breaks into single spaces', () => {
      expect(titleCase('jane\tdoe\nsmith\r\nbrown')).toBe('Jane Doe Smith Brown');
      expect(titleCase('jane \t\n doe')).toBe('Jane Doe');
    });

    it('treats non-breaking and other Unicode spaces as whitespace', () => {
      expect(titleCase('new york')).toBe('New York');
      expect(titleCase(' new york　')).toBe('New York');
    });
  });

  describe('existing capitals', () => {
    it('leaves an already title-cased value unchanged', () => {
      expect(titleCase('Jane Doe')).toBe('Jane Doe');
    });

    it('never lowercases, so deliberate casing survives', () => {
      expect(titleCase('ronald mcDonald')).toBe('Ronald McDonald');
      expect(titleCase('NASA project')).toBe('NASA Project');
      expect(titleCase('JANE DOE')).toBe('JANE DOE');
      expect(titleCase('e2e widget')).toBe('E2e Widget');
      expect(titleCase('E2E Widget')).toBe('E2E Widget');
    });

    it('is idempotent', () => {
      for (const input of ['  jane   doe ', 'jean-luc o\'neil', 'élodie\tçelik', '2nd avenue']) {
        const once = titleCase(input);
        expect(titleCase(once)).toBe(once);
      }
    });
  });

  describe('short words', () => {
    it('uppercases single letters', () => {
      expect(titleCase('x')).toBe('X');
      expect(titleCase('a b c')).toBe('A B C');
      expect(titleCase('john f kennedy')).toBe('John F Kennedy');
    });
  });

  describe('word boundaries', () => {
    it('does not start a new word after a hyphen', () => {
      expect(titleCase('jean-luc picard')).toBe('Jean-luc Picard');
      expect(titleCase('x-ray scanner')).toBe('X-ray Scanner');
    });

    it('keeps a capital typed after a hyphen', () => {
      expect(titleCase('jean-Luc')).toBe('Jean-Luc');
      expect(titleCase('anne-marie smith-Jones')).toBe('Anne-marie Smith-Jones');
    });

    it('does not start a new word after an apostrophe', () => {
      expect(titleCase("o'neil")).toBe("O'neil");
      expect(titleCase("O'Neil")).toBe("O'Neil");
    });

    it('leaves words that start with a digit or punctuation alone', () => {
      expect(titleCase('2nd avenue')).toBe('2nd Avenue');
      expect(titleCase('1700000000')).toBe('1700000000');
      expect(titleCase('(draft) plan')).toBe('(draft) Plan');
      expect(titleCase('route 66')).toBe('Route 66');
    });
  });

  describe('Unicode', () => {
    it('uppercases accented Latin letters', () => {
      expect(titleCase('élodie çelik')).toBe('Élodie Çelik');
      expect(titleCase('ñandú östra')).toBe('Ñandú Östra');
    });

    it('uppercases Greek and Cyrillic letters', () => {
      expect(titleCase('αθήνα')).toBe('Αθήνα');
      expect(titleCase('нижний новгород')).toBe('Нижний Новгород');
    });

    it('keeps a combining accent on the uppercased letter', () => {
      // "e" followed by U+0301 COMBINING ACUTE ACCENT.
      expect(titleCase('élodie')).toBe('Élodie');
    });

    it('uppercases a letter outside the Basic Multilingual Plane', () => {
      // Deseret small letters, each a surrogate pair in UTF-16.
      expect(titleCase('\u{10428}\u{1042F}')).toBe('\u{10400}\u{1042F}');
    });

    it('leaves scripts without case, and emoji, unchanged', () => {
      expect(titleCase('東京 タワー')).toBe('東京 タワー');
      expect(titleCase('🙂 smile')).toBe('🙂 Smile');
    });
  });

  describe('locale', () => {
    it('uses the given locale to uppercase', () => {
      expect(titleCase('istanbul izmir', 'tr')).toBe('İstanbul İzmir');
      expect(titleCase('istanbul izmir', 'en')).toBe('Istanbul Izmir');
    });

    it('accepts a list of locales in order of preference', () => {
      expect(titleCase('izmir', ['tr', 'en'])).toBe('İzmir');
    });

    it("defaults to the runtime's locale", () => {
      expect(titleCase('istanbul')).toBe(`${'i'.toLocaleUpperCase()}stanbul`);
    });

    it('throws a RangeError for an invalid locale tag', () => {
      expect(() => titleCase('istanbul', 'not a locale!')).toThrow(RangeError);
    });
  });
});
