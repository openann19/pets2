import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
// Can be imported from a shared config
export const locales = ['en', 'bg'];
export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale))
        notFound();
    return {
        locale: locale,
        messages: (await import(`../messages/${locale}.json`)).default,
        timeZone: 'UTC',
        now: new Date(),
        formats: {
            dateTime: {
                short: {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }
            },
            number: {
                precise: {
                    maximumFractionDigits: 5
                }
            }
        }
    };
});
//# sourceMappingURL=i18n.js.map