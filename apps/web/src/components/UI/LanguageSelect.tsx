'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
export default function LanguageSelect({ compact = false }) {
    // Handle missing translations gracefully
    let t;
    let locale;
    try {
        t = useTranslations();
        locale = useLocale();
    }
    catch (error) {
        // Fallback translations and locale if context is missing
        t = (key) => {
            const fallbacks = {
                'navigation.language': 'Language',
                'navigation.home': 'Home',
                'navigation.about': 'About',
                'navigation.contact': 'Contact',
            };
            return fallbacks[key] || key;
        };
        locale = 'en'; // Default to English
    }
    const router = useRouter();
    const pathname = usePathname();
    const handleLanguageChange = () => {
        const newLocale = locale === 'en' ? 'bg' : 'en';
        // Remove current locale from pathname and add new locale
        const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
        const newPath = `/${newLocale}${pathWithoutLocale}`;
        router.push(newPath);
    };
    const isBG = locale === 'bg';
    return (<div className={compact ? 'relative z-50 inline-flex' : 'inline-flex'}>
      <div className={`inline-flex items-center rounded-full border border-white/40 backdrop-blur-sm shadow ring-1 ring-white/20 ${isBG ? 'bg-primary-500/90' : 'bg-white/30'} transition-colors`}> 
        <button type="button" aria-label={t('navigation.language')} onClick={handleLanguageChange} className={`px-3 py-1 text-sm font-medium ${isBG ? 'text-white' : 'text-gray-800'}`}>
          {isBG ? 'BG' : 'EN'}
        </button>
      </div>
    </div>);
}
//# sourceMappingURL=LanguageSelect.jsx.map