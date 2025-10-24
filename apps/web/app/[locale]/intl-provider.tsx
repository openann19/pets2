'use client';

import {NextIntlClientProvider} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  locale: string;
  messages: any;
  children: ReactNode;
};

export function IntlProvider({locale, messages, children}: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

