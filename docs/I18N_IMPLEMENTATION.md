# Bulgarian Localization (bg-BG) Implementation Guide

## Overview
This document describes the complete Bulgarian localization implementation for PawfectMatch mobile app using i18next + react-i18next + react-native-localize.

## File Structure
```
apps/mobile/src/i18n/
├── index.ts                    # i18n initialization
├── detectors.ts               # Language detection & persistence
├── formatters.ts              # Date/number/currency formatting
└── locales/
    ├── en/
    │   ├── common.json        # Common strings
    │   ├── auth.json          # Authentication strings
    │   ├── map.json           # Map feature strings
    │   ├── chat.json          # Chat feature strings
    │   └── premium.json       # Premium feature strings
    └── bg/
        ├── common.json
        ├── auth.json
        ├── map.json
        ├── chat.json
        └── premium.json
```

## Usage Examples

### Basic Translation
```typescript
import { useTranslation } from 'react-i18next';

export const LoginScreen = () => {
  const { t } = useTranslation('auth');
  
  return (
    <View>
      <Text>{t('login_title')}</Text>
      <Button title={t('login_button')} />
    </View>
  );
};
```

### With Interpolation
```typescript
const { t } = useTranslation('common');
<Text>{t('greeting', { name: 'Ivan' })}</Text>
```

### Pluralization
```typescript
// In JSON: "photo_count_one": "{{count}} снимка", "photo_count_other": "{{count}} снимки"
<Text>{t('photo_count', { count: photoCount })}</Text>
```

### Formatting
```typescript
import { fmtDate, fmtMoney, fmtNumber } from '@/i18n/formatters';

<Text>{fmtDate(new Date())}</Text>           // 27.10.2025
<Text>{fmtMoney(99.99)}</Text>              // 99,99 лв.
<Text>{fmtNumber(1000)}</Text>              // 1 000
```

### Language Switching
```typescript
import { changeLanguage } from '@/i18n/detectors';

const handleLanguageChange = async (lang: 'en' | 'bg') => {
  await changeLanguage(lang);
};
```

## Scripts

### Extract Strings
```bash
pnpm i18n:scan
```
Scans all .ts/.tsx files and generates/updates JSON files with new keys.

### Validate Translations
```bash
pnpm i18n:check
```
Fails if missing keys or empty translations in Bulgarian.

## ESLint Rules

### No Hardcoded Strings
The `i18next/no-literal-string` rule prevents hardcoded user-visible strings:

```typescript
// ❌ WRONG
<Text>Login</Text>

// ✅ CORRECT
const { t } = useTranslation('auth');
<Text>{t('login_button')}</Text>
```

### No Theme Namespace
The `local/no-theme-namespace` rule prevents importing Theme from unified-theme:

```typescript
// ❌ WRONG
import { Theme } from '../theme/unified-theme';
<Text style={{ color: Theme.colors.primary[500] }}>Text</Text>

// ✅ CORRECT
import { useTheme } from '../theme/Provider';
const theme = useTheme();
<Text style={{ color: theme.colors.primary[500] }}>Text</Text>
```

## Testing

### Unit Tests
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'bg',
    resources: {
      bg: { common: require('@/i18n/locales/bg/common.json') }
    }
  });
});
```

### E2E Tests (Detox)
```typescript
// Run in Bulgarian
beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    languageAndLocale: { language: 'bg', locale: 'bg_BG' }
  });
});

// Check translations
await expect(element(by.text(i18n.t('auth.login_button')))).toBeVisible();
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Check i18n
  run: pnpm i18n:check

- name: Scan for hardcoded strings
  run: pnpm lint -- --rule 'i18next/no-literal-string: error'

- name: E2E Tests (English)
  run: pnpm e2e:test

- name: E2E Tests (Bulgarian)
  run: pnpm e2e:test -- --language bg
```

## Translation Guidelines

### Tone
- Use formal "Вие" for user-facing content
- Keep tone friendly and professional
- Match English capitalization style (sentence case)

### Formatting
- Use Bulgarian punctuation (no space before punctuation)
- Currency: "лв." (leva) after amount
- Abbreviations: "гр." (град - city), "ул." (улица - street)

### Pluralization
Bulgarian plural rules:
- One: n === 1
- Other: n !== 1

Example:
```json
{
  "pet_count_one": "{{count}} домашен любимец",
  "pet_count_other": "{{count}} домашни любимци"
}
```

## Dates, Numbers, Currency

All formatting is centralized in `formatters.ts`:

```typescript
// Date: 27.10.2025
fmtDate(new Date())

// Number: 1 000
fmtNumber(1000)

// Currency: 99,99 лв.
fmtMoney(99.99)
```

## Font Support

Ensure the app font supports Cyrillic characters:
- Current font: [Check in theme/tokens]
- Fallback: Inter with Cyrillic subset
- Line-height: Increase by 10-20% for Cyrillic text

## Deliverables Checklist

- [x] i18n initialization (index.ts)
- [x] Language detection & persistence (detectors.ts)
- [x] Formatters for dates/numbers/currency (formatters.ts)
- [x] All locale JSON files (en & bg)
- [x] Language switcher component
- [x] i18next-scanner configuration
- [x] i18n validation script
- [x] ESLint rules configured
- [x] App.tsx wrapped with I18nextProvider
- [ ] All hardcoded strings replaced with t()
- [ ] Unit tests for hooks
- [ ] E2E tests for both languages
- [ ] Store metadata localization (App Store/Play Store)

## Next Steps

1. **Codemod Phase**: Replace all hardcoded strings with t() calls
2. **Translation Review**: Have native Bulgarian speaker review translations
3. **Testing**: Run full test suite in both languages
4. **Store Metadata**: Localize app store listings
5. **Deployment**: Release with Bulgarian support

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [react-native-localize](https://github.com/react-native-localize/react-native-localize)
- [Bulgarian Language Guide](https://en.wikipedia.org/wiki/Bulgarian_language)
