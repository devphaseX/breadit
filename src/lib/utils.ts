import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict } from 'date-fns';
import locale from 'date-fns/locale/en-US';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatDistanceLocale = {
  lessThanXSeconds: 'just now',
  xSeconds: 'just now',
  halfAMinute: 'just now',
  lessThanXMinutes: '{{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '{{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '{{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '{{count}}m',
  xMonths: '{{count}}m',
  aboutXYears: '{{count}}y',
  xYears: '{{count}}y',
  overXYears: '{{count}}y',
  almostXYears: '{{count}}y',
};

type FormatDistanceLocale = typeof formatDistanceLocale;

interface FormatDistanceOption {
  addSuffix?: boolean;
  comparison?: number;
}

function formatDistance<Token extends keyof FormatDistanceLocale>(
  token: Token,
  count: number,
  options?: FormatDistanceOption
): string {
  options = options || {};

  const result = formatDistanceLocale[token].replace(
    '{{count}}',
    count.toString()
  );

  if (options.addSuffix) {
    if (options.comparison ?? 0 > 0) {
      return 'in ' + result;
    } else {
      if (result === 'just now') return result;
      return result + ' ago';
    }
  }

  return result;
}

export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
}

export type { FormatDistanceOption };
