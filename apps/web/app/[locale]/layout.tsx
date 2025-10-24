import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { IntlProvider } from './intl-provider';

import { locales } from '@/i18n';

export function generateStaticParams(): Array<{ locale: string }> {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{locale: string}>;
}

const LocaleLayout = async function ({
  children,
  params,
}: LocaleLayoutProps) {
  const {locale} = await params;
  
  if (!locales.includes(locale as (typeof locales)[number])) notFound();

  const messages = await getMessages({locale});

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default LocaleLayout;
