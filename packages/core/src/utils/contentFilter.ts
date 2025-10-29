export interface ContentFilterConfig {
  blockedKeywords?: string[];
  caseSensitive?: boolean;
  replacement?: string;
}

const DEFAULT_BLOCKED = ['scam', 'spam', 'abuse'];

export function filterContent(input: string, config?: ContentFilterConfig) {
  const blocked =
    config?.blockedKeywords != null && config.blockedKeywords.length > 0
      ? config.blockedKeywords
      : DEFAULT_BLOCKED;
  const flags = config?.caseSensitive === true ? 'g' : 'gi';
  const replacement = config?.replacement ?? '***';

  let output = input;
  const matched: string[] = [];
  for (const kw of blocked) {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags);
    if (re.test(output)) {
      matched.push(kw);
      output = output.replace(re, replacement);
    }
  }
  return { output, matched };
}
