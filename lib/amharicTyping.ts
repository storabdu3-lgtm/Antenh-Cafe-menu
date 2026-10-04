// Comprehensive Ethiopic / Amharic Phonetic Transliteration & Fidel Matrix

export interface FidelRow {
  base: string;
  name: string;
  orders: [string, string, string, string, string, string, string]; // 1st to 7th
}

export const AMHARIC_FIDEL_TABLE: FidelRow[] = [
  { base: 'ሀ', name: 'ሀ (Ha)', orders: ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ'] },
  { base: 'ለ', name: 'ለ (La)', orders: ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'] },
  { base: 'ሐ', name: 'ሐ (Hha)', orders: ['ሐ', 'ሑ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ'] },
  { base: 'መ', name: 'መ (Ma)', orders: ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'] },
  { base: 'ሠ', name: 'ሠ (Ssa)', orders: ['ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ'] },
  { base: 'ረ', name: 'ረ (Ra)', orders: ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'] },
  { base: 'ሰ', name: 'ሰ (Sa)', orders: ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'] },
  { base: 'ሸ', name: 'ሸ (Sha)', orders: ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'] },
  { base: 'ቀ', name: 'ቀ (Qa)', orders: ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'] },
  { base: 'በ', name: 'በ (Ba)', orders: ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'] },
  { base: 'ተ', name: 'ተ (Ta)', orders: ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'] },
  { base: 'ቸ', name: 'ቸ (Cha)', orders: ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'] },
  { base: 'ኀ', name: 'ኀ (Hxa)', orders: ['ኀ', 'ኁ', 'ኂ', 'ኃ', 'ኄ', 'ኅ', 'ኆ'] },
  { base: 'ነ', name: 'ነ (Na)', orders: ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'] },
  { base: 'ኘ', name: 'ኘ (Nya)', orders: ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'] },
  { base: 'አ', name: 'አ (A)', orders: ['አ', 'ኡ', 'ኢ', 'ኣ', 'ኤ', 'እ', 'ኦ'] },
  { base: 'ከ', name: 'ከ (Ka)', orders: ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'] },
  { base: 'ኸ', name: 'ኸ (Kha)', orders: ['ኸ', 'ኹ', 'ኺ', 'ኻ', 'ኼ', 'ኽ', 'ኾ'] },
  { base: 'ወ', name: 'ወ (Wa)', orders: ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'] },
  { base: 'ዐ', name: 'ዐ (Aa)', orders: ['ዐ', 'ዑ', 'ዒ', 'ዓ', 'ዔ', 'ዕ', 'ዖ'] },
  { base: 'ዘ', name: 'ዘ (Za)', orders: ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'] },
  { base: 'ዠ', name: 'ዠ (Zha)', orders: ['ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ'] },
  { base: 'የ', name: 'የ (Ya)', orders: ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'] },
  { base: 'ደ', name: 'ደ (Da)', orders: ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'] },
  { base: 'ጀ', name: 'ጀ (Ja)', orders: ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ'] },
  { base: 'ገ', name: 'ገ (Ga)', orders: ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'] },
  { base: 'ጠ', name: 'ጠ (Txa)', orders: ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ'] },
  { base: 'ጨ', name: 'ጨ (Cxa)', orders: ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ'] },
  { base: 'ጰ', name: 'ጰ (Pxa)', orders: ['ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ'] },
  { base: 'ጸ', name: 'ጸ (Tsa)', orders: ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ'] },
  { base: 'ፀ', name: 'ፀ (Tza)', orders: ['ፀ', 'ፁ', 'ፂ', 'ፃ', 'ፄ', 'ፅ', 'ፆ'] },
  { base: 'ፈ', name: 'ፈ (Fa)', orders: ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'] },
  { base: 'ፐ', name: 'ፐ (Pa)', orders: ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ'] },
];

export const AMHARIC_CAFE_PRESETS = [
  { amharic: 'ስፔሻል ማኪያቶ', english: 'Special Macchiato', category: 'Coffee' },
  { amharic: 'ካፑቺኖ', english: 'Cappuccino', category: 'Coffee' },
  { amharic: 'ካፌ ላቴ', english: 'Caffè Latte', category: 'Coffee' },
  { amharic: 'ስፔሻል ይርጋጨፌ ቡና', english: 'Special Yirgacheffe Coffee', category: 'Coffee' },
  { amharic: 'ጥቁር ቡና', english: 'Black Coffee', category: 'Coffee' },
  { amharic: 'ስፕሪስ ሻይ', english: 'Spiced Tea (Spreece)', category: 'Tea' },
  { amharic: 'የዝንጅብል ሻይ', english: 'Ginger Tea', category: 'Tea' },
  { amharic: 'የቤልጂየም ኬክ', english: 'Belgian Cake', category: 'Bakery' },
  { amharic: 'ክሩዋሳን', english: 'Croissant', category: 'Bakery' },
  { amharic: 'ልዩ ቁርስ', english: 'Special Breakfast', category: 'Breakfast' },
  { amharic: 'ቺዝ በርገር', english: 'Cheese Burger', category: 'Burger' },
  { amharic: 'ክለብ ሳንድዊች', english: 'Club Sandwich', category: 'Burger' },
  { amharic: 'የዶሮ ፒዛ', english: 'Chicken Pizza', category: 'Pizza' },
  { amharic: 'አቮካዶ ጁስ', english: 'Avocado Juice', category: 'Fresh Juice' },
  { amharic: 'ስፕሪስ ጁስ', english: 'Mixed Juice', category: 'Fresh Juice' },
  { amharic: 'ፓስታ ቦሎኔዝ', english: 'Pasta Bolognese', category: 'Pasta' },
  { amharic: 'ልዩ ጥብስ', english: 'Special Tibs', category: 'Main Course' },
  { amharic: 'እንጀራ ፍርፍር', english: 'Injera Firfir', category: 'Breakfast' },
];

// Phonetic syllable transliteration map
const SYLLABLE_MAP: Record<string, string> = {
  // Common Cafe Words Direct Replacements
  makiyato: 'ማኪያቶ',
  makiato: 'ማኪያቶ',
  machiyato: 'ማኪያቶ',
  kapuchino: 'ካፑቺኖ',
  cappuccino: 'ካፑቺኖ',
  late: 'ላቴ',
  latte: 'ላቴ',
  buna: 'ቡና',
  shai: 'ሻይ',
  shay: 'ሻይ',
  keik: 'ኬክ',
  keke: 'ኬክ',
  cake: 'ኬክ',
  dabo: 'ዳቦ',
  kors: 'ቁርስ',
  qurs: 'ቁርስ',
  piza: 'ፒዛ',
  pizza: 'ፒዛ',
  berger: 'በርገር',
  burger: 'በርገር',
  pasta: 'ፓስታ',
  sanduwich: 'ሳንድዊች',
  sandwich: 'ሳንድዊች',
  speshal: 'ስፔሻል',
  special: 'ስፔሻል',
  liyu: 'ልዩ',
  yirgachefe: 'ይርጋጨፌ',
  sidama: 'ሲዳማ',
  avocado: 'አቮካዶ',
  avokado: 'አቮካዶ',
  mango: 'ማንጎ',
  birtukan: 'ብርቱካን',
  wetet: 'ወተት',
  injera: 'እንጀራ',
  tibs: 'ጥብስ',
  firfir: 'ፍርፍር',
  chiz: 'ቺዝ',
  cheese: 'ቺዝ',
  doro: 'ዶሮ',
  siga: 'ስጋ',
  asa: 'ዓሣ',
  coffee: 'ቡና',
  tea: 'ሻይ',
  milk: 'ወተት',
  juice: 'ጁስ',
  breakfast: 'ቁርስ',
  salad: 'ሰላጣ',
  croissant: 'ክሩዋሳን',
  belgian: 'የቤልጂየም',
  black: 'ጥቁር',
  ginger: 'ዝንጅብል',
  ice: 'አይስ',
  iced: 'አይስድ',
  cold: 'ቀዝቃዛ',
  hot: 'ትኩስ',
  chocolate: 'ቸኮሌት',
  vanilla: 'ቫኒላ',
  caramel: 'ካራሜል',
  mocha: 'ሞካ',
  americano: 'አሜሪካኖ',
  espresso: 'ኤስፕሬሶ',
  lemon: 'ሎሚ',
  water: 'ውሃ',
  club: 'ክለብ',
  chicken: 'የዶሮ',
  beef: 'የበሬ',
  egg: 'እንቁላል',
  omelette: 'ኦምሌት',
  bread: 'ዳቦ',
  fries: 'ቺፕስ',
  chips: 'ቺፕስ',
  soup: 'ሾርባ',
  fish: 'ዓሣ',
  meat: 'ስጋ',
};

/**
 * Checks whether a string contains any Ethiopic / Amharic characters.
 */
export function containsAmharic(text: string): boolean {
  return /[\u1200-\u137F]/.test(text);
}

/**
 * Intelligently separates a combined bilingual name into English and Amharic components.
 * e.g., "Special Macchiato / ልዩ ማኪያቶ" -> { english: "Special Macchiato", amharic: "ልዩ ማኪያቶ" }
 */
export function splitBilingualName(fullName: string): { english: string; amharic: string } {
  if (!fullName) return { english: '', amharic: '' };

  const trimmed = fullName.trim();

  // Pattern 1: Slash separator "English / Amharic" or "Amharic / English"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map((s) => s.trim());
    if (parts.length >= 2) {
      if (containsAmharic(parts[1]) && !containsAmharic(parts[0])) {
        return { english: parts[0], amharic: parts[1] };
      }
      if (containsAmharic(parts[0]) && !containsAmharic(parts[1])) {
        return { english: parts[1], amharic: parts[0] };
      }
    }
  }

  // Pattern 2: Parentheses "English (Amharic)" or "Amharic (English)"
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenMatch) {
    const outside = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    if (containsAmharic(inside) && !containsAmharic(outside)) {
      return { english: outside, amharic: inside };
    }
    if (containsAmharic(outside) && !containsAmharic(inside)) {
      return { english: inside, amharic: outside };
    }
  }

  // Single script
  if (containsAmharic(trimmed)) {
    return { english: '', amharic: trimmed };
  }

  return { english: trimmed, amharic: '' };
}

/**
 * Formats bilingual product name according to selected format
 */
export function formatBilingualName(
  english: string,
  amharic: string,
  format: 'both' | 'amharic_first' | 'english_only' | 'amharic_only' = 'both'
): string {
  const eng = (english || '').trim();
  const amh = (amharic || '').trim();

  if (!eng && !amh) return '';
  if (!amh) return eng;
  if (!eng) return amh;

  switch (format) {
    case 'amharic_first':
      return `${amh} / ${eng}`;
    case 'english_only':
      return eng;
    case 'amharic_only':
      return amh;
    case 'both':
    default:
      return `${eng} / ${amh}`;
  }
}

// Character-by-character phonetic phonetic dictionary
const PHONETIC_MAP: [RegExp, string][] = [
  // 3-letter combos
  [/tsh/gi, 'ች'],
  [/zh/gi, 'ዥ'],
  [/sh/gi, 'ሽ'],
  [/ch/gi, 'ች'],
  [/gn/gi, 'ኝ'],
  [/ny/gi, 'ኝ'],
  [/ts/gi, 'ጽ'],
  [/kh/gi, 'ኽ'],
  [/hh/gi, 'ሕ'],

  // Syllables with vowels
  // ሀ family
  [/h[uU]/g, 'ሁ'], [/h[iI]/g, 'ሂ'], [/h[aA]/g, 'ሃ'], [/h[eE]/g, 'ሄ'], [/h[oO]/g, 'ሆ'],
  // ለ family
  [/l[uU]/g, 'ሉ'], [/l[iI]/g, 'ሊ'], [/l[aA]/g, 'ላ'], [/l[eE]/g, 'ሌ'], [/l[oO]/g, 'ሎ'],
  // መ family
  [/m[uU]/g, 'ሙ'], [/m[iI]/g, 'ሚ'], [/m[aA]/g, 'ማ'], [/m[eE]/g, 'ሜ'], [/m[oO]/g, 'ሞ'],
  // ረ family
  [/r[uU]/g, 'ሩ'], [/r[iI]/g, 'ሪ'], [/r[aA]/g, 'ራ'], [/r[eE]/g, 'ሬ'], [/r[oO]/g, 'ሮ'],
  // ሰ family
  [/s[uU]/g, 'ሱ'], [/s[iI]/g, 'ሲ'], [/s[aA]/g, 'ሳ'], [/s[eE]/g, 'ሴ'], [/s[oO]/g, 'ሶ'],
  // ሸ family
  [/sh[uU]/g, 'ሹ'], [/sh[iI]/g, 'ሺ'], [/sh[aA]/g, 'ሻ'], [/sh[eE]/g, 'ሼ'], [/sh[oO]/g, 'ሾ'],
  // ቀ family
  [/q[uU]/g, 'ቁ'], [/q[iI]/g, 'ቂ'], [/q[aA]/g, 'ቃ'], [/q[eE]/g, 'ቄ'], [/q[oO]/g, 'ቆ'],
  // በ family
  [/b[uU]/g, 'ቡ'], [/b[iI]/g, 'ቢ'], [/b[aA]/g, 'ባ'], [/b[eE]/g, 'ቤ'], [/b[oO]/g, 'ቦ'],
  // ተ family
  [/t[uU]/g, 'ቱ'], [/t[iI]/g, 'ቲ'], [/t[aA]/g, 'ታ'], [/t[eE]/g, 'ቴ'], [/t[oO]/g, 'ቶ'],
  // ቸ family
  [/ch[uU]/g, 'ቹ'], [/ch[iI]/g, 'ቺ'], [/ch[aA]/g, 'ቻ'], [/ch[eE]/g, 'ቼ'], [/ch[oO]/g, 'ቾ'],
  // ነ family
  [/n[uU]/g, 'ኑ'], [/n[iI]/g, 'ኒ'], [/n[aA]/g, 'ና'], [/n[eE]/g, 'ኔ'], [/n[oO]/g, 'ኖ'],
  // ኘ family
  [/gn[uU]/g, 'ኙ'], [/gn[iI]/g, 'ኚ'], [/gn[aA]/g, 'ኛ'], [/gn[eE]/g, 'ኜ'], [/gn[oO]/g, 'ኞ'],
  [/ny[uU]/g, 'ኙ'], [/ny[iI]/g, 'ኚ'], [/ny[aA]/g, 'ኛ'], [/ny[eE]/g, 'ኜ'], [/ny[oO]/g, 'ኞ'],
  // ከ family
  [/k[uU]/g, 'ኩ'], [/k[iI]/g, 'ኪ'], [/k[aA]/g, 'ካ'], [/k[eE]/g, 'ኬ'], [/k[oO]/g, 'ኮ'],
  // ወ family
  [/w[uU]/g, 'ዉ'], [/w[iI]/g, 'ዊ'], [/w[aA]/g, 'ዋ'], [/w[eE]/g, 'ዌ'], [/w[oO]/g, 'ዎ'],
  // ዘ family
  [/z[uU]/g, 'ዙ'], [/z[iI]/g, 'ዚ'], [/z[aA]/g, 'ዛ'], [/z[eE]/g, 'ዜ'], [/z[oO]/g, 'ዞ'],
  // ዠ family
  [/zh[uU]/g, 'ዡ'], [/zh[iI]/g, 'ዢ'], [/zh[aA]/g, 'ዣ'], [/zh[eE]/g, 'ዤ'], [/zh[oO]/g, 'ዦ'],
  // የ family
  [/y[uU]/g, 'ዩ'], [/y[iI]/g, 'ዪ'], [/y[aA]/g, 'ያ'], [/y[eE]/g, 'ዬ'], [/y[oO]/g, 'ዮ'],
  // ደ family
  [/d[uU]/g, 'ዱ'], [/d[iI]/g, 'ዲ'], [/d[aA]/g, 'ዳ'], [/d[eE]/g, 'ዴ'], [/d[oO]/g, 'ዶ'],
  // ጀ family
  [/j[uU]/g, 'ጁ'], [/j[iI]/g, 'ጂ'], [/j[aA]/g, 'ጃ'], [/j[eE]/g, 'ጄ'], [/j[oO]/g, 'ጆ'],
  // ገ family
  [/g[uU]/g, 'ጉ'], [/g[iI]/g, 'ጊ'], [/g[aA]/g, 'ጋ'], [/g[eE]/g, 'ጌ'], [/g[oO]/g, 'ጎ'],
  // ጠ family
  [/T[uU]/g, 'ጡ'], [/T[iI]/g, 'ጢ'], [/T[aA]/g, 'ጣ'], [/T[eE]/g, 'ጤ'], [/T[oO]/g, 'ጦ'],
  // ጨ family
  [/C[uU]/g, 'ጩ'], [/C[iI]/g, 'ጪ'], [/C[aA]/g, 'ጫ'], [/C[eE]/g, 'ጬ'], [/C[oO]/g, 'ጮ'],
  // ፈ family
  [/f[uU]/g, 'ፉ'], [/f[iI]/g, 'ፊ'], [/f[aA]/g, 'ፋ'], [/f[eE]/g, 'ፌ'], [/f[oO]/g, 'ፎ'],
  // ፐ family
  [/p[uU]/g, 'ፑ'], [/p[iI]/g, 'ፒ'], [/p[aA]/g, 'ፓ'], [/p[eE]/g, 'ፔ'], [/p[oO]/g, 'ፖ'],

  // Standalone vowels
  [/aa/gi, 'ኣ'],
  [/ee/gi, 'ኤ'],
  [/oo/gi, 'ኦ'],
  [/a/gi, 'አ'],
  [/u/gi, 'ኡ'],
  [/i/gi, 'ኢ'],
  [/e/gi, 'እ'],
  [/o/gi, 'ኦ'],

  // Standalone 6th order consonants
  [/h/gi, 'ህ'],
  [/l/gi, 'ል'],
  [/m/gi, 'ም'],
  [/r/gi, 'ር'],
  [/s/gi, 'ስ'],
  [/q/gi, 'ቅ'],
  [/b/gi, 'ብ'],
  [/t/gi, 'ት'],
  [/n/gi, 'ን'],
  [/k/gi, 'ክ'],
  [/w/gi, 'ው'],
  [/z/gi, 'ዝ'],
  [/y/gi, 'ይ'],
  [/d/gi, 'ድ'],
  [/j/gi, 'ጅ'],
  [/g/gi, 'ግ'],
  [/f/gi, 'ፍ'],
  [/p/gi, 'ፕ'],
];

/**
 * Phonetically translates Latin keystrokes/words into Amharic Fidel.
 */
export function convertPhoneticToAmharic(text: string): string {
  if (!text) return '';

  // Process word by word for word-level substitutions
  const words = text.split(/(\s+)/);
  const convertedWords = words.map((word) => {
    const trimmedLower = word.trim().toLowerCase();
    if (SYLLABLE_MAP[trimmedLower]) {
      return SYLLABLE_MAP[trimmedLower];
    }

    let result = word;
    for (const [pattern, replacement] of PHONETIC_MAP) {
      result = result.replace(pattern, replacement);
    }
    return result;
  });

  return convertedWords.join('');
}
