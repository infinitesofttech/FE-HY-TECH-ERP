import en from './en.json';
import gu from './gu.json';
import hi from './hi.json';

export type LanguageCode = 'en' | 'gu' | 'hi' | string;

export interface TranslationDictionary {
  [key: string]: any;
}

export const translations: Record<string, TranslationDictionary> = {
  en,
  gu,
  hi,
};

/**
 * Resolves a nested key (e.g. 'hrms.working_days') or a flat key (e.g. 'nav_dashboard')
 * from the dictionary.
 */
export function getNestedTranslation(
  dict: TranslationDictionary | undefined,
  path: string
): string | undefined {
  if (!dict) return undefined;
  
  // 1. Direct key match
  if (typeof dict[path] === 'string') {
    return dict[path];
  }

  // 2. Dot-separated path lookup
  if (path.includes('.')) {
    const parts = path.split('.');
    let current: any = dict;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    if (typeof current === 'string') {
      return current;
    }
  }

  return undefined;
}

/**
 * Cleanly formats employee or entity names according to active language.
 * E.g., 'જાદવ દુર્ગેશ (Jadav Durgesh)' ->
 * - In English ('en') or other non-Gujarati: 'Jadav Durgesh'
 * - In Gujarati ('gu'): 'જાદવ દુર્ગેશ'
 */
export function formatEmpName(name: string, language: string = 'en'): string {
  if (!name) return '';
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const part1 = match[1].trim();
    const part2 = match[2].trim();
    if (language === 'gu') {
      if (/[\u0A80-\u0AFF]/.test(part1)) return part1;
      if (/[\u0A80-\u0AFF]/.test(part2)) return part2;
      return part1;
    } else {
      if (/[A-Za-z]/.test(part2)) return part2;
      if (/[A-Za-z]/.test(part1)) return part1;
      return part2;
    }
  }
  return name;
}

/**
 * Returns an avatar initial that strictly adheres to the active language script.
 * In English/Hindi, guarantees a Latin letter [A-Z].
 * In Gujarati, extracts the Gujarati letter.
 */
export function getEmpInitial(
  name: string,
  language: string = 'en',
  username?: string,
  fallback: string = 'S'
): string {
  if (language === 'gu') {
    const formatted = formatEmpName(name, 'gu');
    return formatted ? formatted[0] : fallback;
  }

  // Non-Gujarati: prioritize English/Latin character
  const formatted = formatEmpName(name, language);
  const latinMatch = formatted.match(/[A-Za-z]/);
  if (latinMatch) {
    return latinMatch[0].toUpperCase();
  }

  // Fallback to username Latin character
  if (username) {
    const userLatin = username.match(/[A-Za-z]/);
    if (userLatin) {
      return userLatin[0].toUpperCase();
    }
  }

  return fallback;
}

export { en, gu, hi };
