import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'pl'] as const;
export const defaultLocale = 'pl' as const;

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale
});
