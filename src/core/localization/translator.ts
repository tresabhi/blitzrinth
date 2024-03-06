import { Locale } from 'discord.js';
import { locales, translations } from './strings';

export function translator(localeRaw: Locale) {
  const locale = locales.includes(localeRaw) ? localeRaw : Locale.EnglishUS;
  const strings = translations[locale];

  function translate(path: string): string {
    const pathArray = path.split('.');
    let fragment = strings;

    for (const pathItem of pathArray) {
      if (typeof fragment === 'string') {
        throw new SyntaxError(
          `Attempted to access string with key "${pathItem}" in "${path}" from within a string instead of an object in locale "${locale}"`,
        );
      } else {
        fragment = fragment[pathItem];

        if (typeof fragment === 'undefined') {
          if (locale === Locale.EnglishUS) {
            throw new Error(
              `Undefined translation at "${pathItem}" in "${path}" for locale "${locale}"`,
            );
          } else {
            console.warn(
              `Undefined translation at "${pathItem}" in "${path}" for locale "${locale}"; falling back to en-US`,
            );
            return translator(Locale.EnglishUS).translate(path);
          }
        }
      }
    }

    if (typeof fragment === 'string') {
      return fragment;
    } else if (fragment.$) {
      return fragment.$!;
    } else {
      throw new Error(
        `Unresolved tree ending for "${path}" in locale "${locale}"`,
      );
    }
  }

  function t(paths: TemplateStringsArray, ...embeds: string[]) {
    return paths
      .map((path, index) =>
        path.length === 0
          ? ''
          : `${translate(path)}${index === embeds.length ? '' : embeds[index]}`,
      )
      .join('');
  }

  return { locale, translate, t };
}