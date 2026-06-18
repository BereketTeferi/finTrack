// Comprehensive currency list with proper symbols and locale info.
// Includes 60+ currencies covering all major world currencies + ETB (Ethiopian Birr).
// Symbol is what we display next to amounts; localeString is the BCP-47 locale
// used by Intl.NumberFormat for proper grouping separators.

export interface Currency {
  code: string;       // ISO 4217 code (e.g. "USD")
  name: string;       // English name (e.g. "US Dollar")
  symbol: string;     // Display symbol (e.g. "$", "Br", "€")
  locale: string;     // BCP-47 locale for Intl.NumberFormat (e.g. "en-US")
}

export const CURRENCIES: Currency[] = [
  // === Major world currencies ===
  { code: "USD", name: "US Dollar",            symbol: "$",   locale: "en-US" },
  { code: "EUR", name: "Euro",                  symbol: "€",   locale: "de-DE" },
  { code: "GBP", name: "British Pound",        symbol: "£",   locale: "en-GB" },
  { code: "JPY", name: "Japanese Yen",          symbol: "¥",   locale: "ja-JP" },
  { code: "CNY", name: "Chinese Yuan",          symbol: "¥",   locale: "zh-CN" },
  { code: "INR", name: "Indian Rupee",          symbol: "₹",   locale: "en-IN" },
  { code: "CHF", name: "Swiss Franc",           symbol: "CHF", locale: "de-CH" },
  { code: "CAD", name: "Canadian Dollar",       symbol: "C$",  locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar",     symbol: "A$",  locale: "en-AU" },
  { code: "NZD", name: "New Zealand Dollar",    symbol: "NZ$", locale: "en-NZ" },

  // === African currencies ===
  { code: "ETB", name: "Ethiopian Birr",        symbol: "Br",  locale: "am-ET" },
  { code: "NGN", name: "Nigerian Naira",        symbol: "₦",   locale: "en-NG" },
  { code: "ZAR", name: "South African Rand",    symbol: "R",   locale: "en-ZA" },
  { code: "KES", name: "Kenyan Shilling",       symbol: "KSh", locale: "en-KE" },
  { code: "GHS", name: "Ghanaian Cedi",         symbol: "₵",   locale: "en-GH" },
  { code: "EGP", name: "Egyptian Pound",        symbol: "E£",  locale: "ar-EG" },
  { code: "MAD", name: "Moroccan Dirham",       symbol: "DH",  locale: "fr-MA" },
  { code: "TND", name: "Tunisian Dinar",        symbol: "DT",  locale: "fr-TN" },
  { code: "UGX", name: "Ugandan Shilling",      symbol: "USh", locale: "en-UG" },
  { code: "TZS", name: "Tanzanian Shilling",    symbol: "TSh", locale: "en-TZ" },
  { code: "RWF", name: "Rwandan Franc",         symbol: "FRw", locale: "en-RW" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", locale: "fr-SN" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", locale: "fr-CM" },

  // === Middle East ===
  { code: "AED", name: "UAE Dirham",            symbol: "AED", locale: "ar-AE" },
  { code: "SAR", name: "Saudi Riyal",           symbol: "SR",  locale: "ar-SA" },
  { code: "QAR", name: "Qatari Riyal",          symbol: "QR",  locale: "ar-QA" },
  { code: "KWD", name: "Kuwaiti Dinar",         symbol: "KD",  locale: "ar-KW" },
  { code: "BHD", name: "Bahraini Dinar",        symbol: "BD",  locale: "ar-BH" },
  { code: "OMR", name: "Omani Rial",            symbol: "OR",  locale: "ar-OM" },
  { code: "JOD", name: "Jordanian Dinar",       symbol: "JD",  locale: "ar-JO" },
  { code: "LBP", name: "Lebanese Pound",        symbol: "L£",  locale: "ar-LB" },
  { code: "ILS", name: "Israeli Shekel",        symbol: "₪",   locale: "he-IL" },
  { code: "TRY", name: "Turkish Lira",          symbol: "₺",   locale: "tr-TR" },
  { code: "IRR", name: "Iranian Rial",          symbol: "﷼",   locale: "fa-IR" },

  // === Asia ===
  { code: "HKD", name: "Hong Kong Dollar",      symbol: "HK$", locale: "en-HK" },
  { code: "TWD", name: "Taiwan Dollar",         symbol: "NT$", locale: "zh-TW" },
  { code: "KRW", name: "South Korean Won",      symbol: "₩",   locale: "ko-KR" },
  { code: "SGD", name: "Singapore Dollar",      symbol: "S$",  locale: "en-SG" },
  { code: "MYR", name: "Malaysian Ringgit",     symbol: "RM",  locale: "en-MY" },
  { code: "THB", name: "Thai Baht",             symbol: "฿",   locale: "th-TH" },
  { code: "IDR", name: "Indonesian Rupiah",     symbol: "Rp",  locale: "id-ID" },
  { code: "PHP", name: "Philippine Peso",       symbol: "₱",   locale: "en-PH" },
  { code: "VND", name: "Vietnamese Dong",       symbol: "₫",   locale: "vi-VN" },
  { code: "PKR", name: "Pakistani Rupee",       symbol: "Rs",  locale: "en-PK" },
  { code: "BDT", name: "Bangladeshi Taka",      symbol: "৳",   locale: "bn-BD" },
  { code: "LKR", name: "Sri Lankan Rupee",      symbol: "Rs",  locale: "en-LK" },
  { code: "NPR", name: "Nepalese Rupee",        symbol: "Rs",  locale: "en-NP" },

  // === Europe (non-Euro) ===
  { code: "SEK", name: "Swedish Krona",         symbol: "kr",  locale: "sv-SE" },
  { code: "NOK", name: "Norwegian Krone",       symbol: "kr",  locale: "nb-NO" },
  { code: "DKK", name: "Danish Krone",          symbol: "kr",  locale: "da-DK" },
  { code: "PLN", name: "Polish Zloty",          symbol: "zł",  locale: "pl-PL" },
  { code: "CZK", name: "Czech Koruna",          symbol: "Kč",  locale: "cs-CZ" },
  { code: "HUF", name: "Hungarian Forint",      symbol: "Ft",  locale: "hu-HU" },
  { code: "RON", name: "Romanian Leu",          symbol: "lei", locale: "ro-RO" },
  { code: "BGN", name: "Bulgarian Lev",         symbol: "lv",  locale: "bg-BG" },
  { code: "HRK", name: "Croatian Kuna",         symbol: "kn",  locale: "hr-HR" },
  { code: "RUB", name: "Russian Ruble",         symbol: "₽",   locale: "ru-RU" },
  { code: "UAH", name: "Ukrainian Hryvnia",     symbol: "₴",   locale: "uk-UA" },
  { code: "ISK", name: "Icelandic Krona",       symbol: "kr",  locale: "is-IS" },

  // === Americas (non-USD) ===
  { code: "MXN", name: "Mexican Peso",          symbol: "MX$", locale: "es-MX" },
  { code: "BRL", name: "Brazilian Real",        symbol: "R$",  locale: "pt-BR" },
  { code: "ARS", name: "Argentine Peso",        symbol: "AR$", locale: "es-AR" },
  { code: "CLP", name: "Chilean Peso",          symbol: "CL$", locale: "es-CL" },
  { code: "COP", name: "Colombian Peso",        symbol: "CO$", locale: "es-CO" },
  { code: "PEN", name: "Peruvian Sol",          symbol: "S/",  locale: "es-PE" },
  { code: "UYU", name: "Uruguayan Peso",        symbol: "UY$", locale: "es-UY" },

  // === Oceania ===
  { code: "FJD", name: "Fijian Dollar",         symbol: "FJ$", locale: "en-FJ" },

  // === Crypto (bonus) ===
  { code: "BTC", name: "Bitcoin",               symbol: "₿",   locale: "en-US" },
  { code: "ETH", name: "Ethereum",              symbol: "Ξ",   locale: "en-US" },
];

// Quick lookup map
export const CURRENCY_MAP: Record<string, Currency> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
);

// Get a currency by code, fallback to USD
export function getCurrency(code: string | undefined | null): Currency {
  if (code && CURRENCY_MAP[code]) return CURRENCY_MAP[code];
  return CURRENCY_MAP.USD;
}
