import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Sparkles, X, Check, Globe, ArrowRightLeft, Layers } from 'lucide-react';
import {
  AMHARIC_FIDEL_TABLE,
  AMHARIC_CAFE_PRESETS,
  convertPhoneticToAmharic,
  splitBilingualName,
  formatBilingualName,
  FidelRow,
} from '../../lib/amharicTyping';

interface AmharicProductInputProps {
  label?: string;
  value: string;
  valueAmharic?: string;
  onChange: (val: string) => void;
  onChangeAmharic?: (val: string) => void;
  placeholder?: string;
  placeholderEnglish?: string;
  placeholderAmharic?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const AmharicProductInput: React.FC<AmharicProductInputProps> = ({
  label = 'Product Name (የምርት ስም - በእንግሊዝኛ እና በአማርኛ) *',
  value,
  valueAmharic,
  onChange,
  onChangeAmharic,
  placeholderEnglish = 'e.g. Special Yirgacheffe Latte, Belgian Cake',
  placeholderAmharic = 'ለምሳሌ፡ ልዩ ይርጋጨፌ ላቴ፣ የቤልጂየም ኬክ',
  required = true,
  className = '',
  id = 'bilingual-product-name',
}) => {
  // Parse initial English and Amharic strings
  const parsed = splitBilingualName(value || '');
  const [englishName, setEnglishName] = useState<string>(
    valueAmharic !== undefined ? value : parsed.english || value
  );
  const [amharicName, setAmharicName] = useState<string>(
    valueAmharic !== undefined ? valueAmharic : parsed.amharic
  );

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isPhoneticActive, setIsPhoneticActive] = useState(true); // Default to ON for easy typing
  const [selectedBaseFidel, setSelectedBaseFidel] = useState<FidelRow>(AMHARIC_FIDEL_TABLE[3]); // Default 'መ'
  const [displayFormat, setDisplayFormat] = useState<'both' | 'amharic_first' | 'english_only' | 'amharic_only'>('both');

  const amharicInputRef = useRef<HTMLInputElement>(null);
  const englishInputRef = useRef<HTMLInputElement>(null);

  // Sync state if props change externally
  useEffect(() => {
    if (valueAmharic !== undefined) {
      setEnglishName(value || '');
      setAmharicName(valueAmharic || '');
    } else {
      const p = splitBilingualName(value || '');
      if (p.english || p.amharic) {
        setEnglishName(p.english || value);
        setAmharicName(p.amharic);
      }
    }
  }, [value, valueAmharic]);

  const notifyChange = (eng: string, amh: string, fmt = displayFormat) => {
    if (onChangeAmharic) {
      onChange(eng);
      onChangeAmharic(amh);
    } else {
      const combined = formatBilingualName(eng, amh, fmt);
      onChange(combined);
    }
  };

  const handleEnglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEnglishName(val);
    notifyChange(val, amharicName);
  };

  const handleAmharicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const finalVal = isPhoneticActive ? convertPhoneticToAmharic(rawVal) : rawVal;
    setAmharicName(finalVal);
    notifyChange(englishName, finalVal);
  };

  // Convert English input to Amharic transliteration
  const handleAutoTranslateFromEnglish = () => {
    if (!englishName.trim()) return;
    const converted = convertPhoneticToAmharic(englishName);
    setAmharicName(converted);
    notifyChange(englishName, converted);
    if (amharicInputRef.current) {
      amharicInputRef.current.focus();
    }
  };

  const handleInsertFidelChar = (char: string) => {
    const updated = (amharicName || '') + char;
    setAmharicName(updated);
    notifyChange(englishName, updated);
    if (amharicInputRef.current) {
      amharicInputRef.current.focus();
    }
  };

  const handleFidelBackspace = () => {
    const updated = (amharicName || '').slice(0, -1);
    setAmharicName(updated);
    notifyChange(englishName, updated);
    if (amharicInputRef.current) {
      amharicInputRef.current.focus();
    }
  };

  const handleSelectPreset = (preset: typeof AMHARIC_CAFE_PRESETS[0]) => {
    setEnglishName(preset.english);
    setAmharicName(preset.amharic);
    notifyChange(preset.english, preset.amharic);
  };

  const handleFormatChange = (fmt: 'both' | 'amharic_first' | 'english_only' | 'amharic_only') => {
    setDisplayFormat(fmt);
    notifyChange(englishName, amharicName, fmt);
  };

  const combinedPreview = formatBilingualName(englishName, amharicName, displayFormat);

  return (
    <div className={`space-y-3.5 bg-[#1E293B]/70 p-4 rounded-2xl border border-white/10 ${className}`}>
      {/* Header with Title and Bilingual Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div>
          <label className="block text-xs sm:text-sm font-extrabold text-[#F8FAFC] flex items-center gap-1.5">
            <Globe className="text-[#D4AF37]" size={16} />
            <span>{label}</span>
          </label>
          <span className="text-[11px] text-[#94A3B8]">
            ስሙን በእንግሊዝኛም በአማርኛም መጻፍ ይችላሉ (Enter product name in English and Amharic)
          </span>
        </div>

        {/* Display Format Quick Switch */}
        <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-xl border border-white/10 text-[11px]">
          <span className="text-[10px] text-[#94A3B8] font-bold px-1.5 uppercase">የስም ቅርጸት:</span>
          <button
            type="button"
            onClick={() => handleFormatChange('both')}
            className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
              displayFormat === 'both' ? 'bg-[#D4AF37] text-[#0F172A] shadow-xs' : 'text-[#CBD5E1] hover:text-white'
            }`}
            title="English / አማርኛ"
          >
            🇺🇸 Eng / 🇪🇹 Amh
          </button>
          <button
            type="button"
            onClick={() => handleFormatChange('amharic_first')}
            className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
              displayFormat === 'amharic_first' ? 'bg-[#D4AF37] text-[#0F172A] shadow-xs' : 'text-[#CBD5E1] hover:text-white'
            }`}
            title="አማርኛ / English"
          >
            🇪🇹 Amh / 🇺🇸 Eng
          </button>
        </div>
      </div>

      {/* DUAL INPUT SECTION: English and Amharic side-by-side or stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. ENGLISH INPUT CARD */}
        <div className="space-y-1.5 bg-[#243244]/80 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor={`${id}-eng`} className="text-xs font-bold text-[#CBD5E1] flex items-center gap-1.5">
              <span>🇺🇸</span>
              <span>English Product Name (የምርት ስም በእንግሊዝኛ) *</span>
            </label>
            {englishName && (
              <button
                type="button"
                onClick={() => {
                  setEnglishName('');
                  notifyChange('', amharicName);
                }}
                className="text-[10px] text-[#94A3B8] hover:text-[#EF4444] transition"
              >
                አጽዳ
              </button>
            )}
          </div>

          <input
            ref={englishInputRef}
            id={`${id}-eng`}
            type="text"
            required={required && !amharicName}
            value={englishName}
            onChange={handleEnglishChange}
            placeholder={placeholderEnglish}
            className="w-full h-11 bg-[#1E293B] text-[#F8FAFC] placeholder-[#64748B] border border-white/10 rounded-xl px-3.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D4AF37] transition-all"
          />

          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-0.5">
            <span>ለምሳሌ፡ Special Macchiato, Belgian Cake</span>
            {englishName && !amharicName && (
              <button
                type="button"
                onClick={handleAutoTranslateFromEnglish}
                className="text-[#D4AF37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                title="እንግሊዝኛውን በራስ-ሰር ወደ አማርኛ ገልብጥ"
              >
                <ArrowRightLeft size={11} />
                <span>ወደ አማርኛ ገልብጥ ➔</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. AMHARIC INPUT CARD */}
        <div className="space-y-1.5 bg-[#243244]/80 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label htmlFor={`${id}-amh`} className="text-xs font-bold text-[#CBD5E1] flex items-center gap-1.5">
              <span>🇪🇹</span>
              <span>Amharic Product Name (የምርት ስም በአማርኛ)</span>
            </label>

            {/* Quick Helper Tools for Amharic */}
            <div className="flex items-center gap-1">
              {/* Phonetic Toggle */}
              <button
                type="button"
                onClick={() => setIsPhoneticActive(!isPhoneticActive)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                  isPhoneticActive
                    ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                    : 'bg-[#1E293B] text-[#94A3B8] border-white/10'
                }`}
                title="በላቲን ፊደላት ሲተይቡ በራስ-ሰር ወደ አማርኛ ይቀይራል (e.g. 'buna' -> 'ቡና')"
              >
                <Sparkles size={11} />
                <span>ፎኔቲክ: {isPhoneticActive ? 'ON' : 'OFF'}</span>
              </button>

              {/* Fidel Keyboard Modal Toggle */}
              <button
                type="button"
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                  isKeyboardOpen
                    ? 'bg-[#D4AF37] text-[#0F172A] border-[#D4AF37]'
                    : 'bg-[#1E293B] text-[#D4AF37] border-[#D4AF37]/30'
                }`}
                title="የአማርኛ ፊደላት መጻፊያ ሰሌዳ ይክፈቱ"
              >
                <Keyboard size={11} />
                <span>ኪቦርድ</span>
              </button>

              {amharicName && (
                <button
                  type="button"
                  onClick={() => {
                    setAmharicName('');
                    notifyChange(englishName, '');
                  }}
                  className="text-[10px] text-[#94A3B8] hover:text-[#EF4444] transition ml-1"
                >
                  አጽዳ
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              ref={amharicInputRef}
              id={`${id}-amh`}
              type="text"
              value={amharicName}
              onChange={handleAmharicChange}
              placeholder={placeholderAmharic}
              className="w-full h-11 bg-[#1E293B] text-[#F8FAFC] placeholder-[#64748B] border border-white/10 rounded-xl px-3.5 pr-20 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            {englishName && !amharicName && (
              <button
                type="button"
                onClick={handleAutoTranslateFromEnglish}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg text-[10px] font-bold transition cursor-pointer"
                title="ከእንግሊዝኛ ስም በራስ-ሰር ገልብጥ"
              >
                ከእንግሊዝኛ
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-0.5">
            <span>ለምሳሌ፡ ልዩ ማኪያቶ፣ የቤልጂየም ኬክ</span>
            {isPhoneticActive && (
              <span className="text-[#22C55E] text-[10px] font-medium">
                ✓ ፎኔቲክ በርቷል (makiyato ሲሉ ማኪያቶ ይሆናል)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QUICK PRESETS ROW (Inserts both English & Amharic simultaneously) */}
      <div className="pt-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Layers size={11} className="text-[#D4AF37]" />
            ፈጣን ዝግጁ ስሞች (ሁለቱንም ይሞላል):
          </span>
          {AMHARIC_CAFE_PRESETS.slice(0, 8).map((preset) => (
            <button
              key={preset.english}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 bg-[#243244] hover:bg-[#D4AF37]/20 hover:text-[#F6C453] text-[#CBD5E1] border border-white/5 hover:border-[#D4AF37]/40 rounded-lg text-[11px] font-medium transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1"
              title={`${preset.english} ↔ ${preset.amharic}`}
            >
              <span>+ {preset.english}</span>
              <span className="text-[#D4AF37] font-bold">({preset.amharic})</span>
            </button>
          ))}
        </div>
      </div>

      {/* COMBINED RESULT PREVIEW BANNER */}
      {(englishName || amharicName) && (
        <div className="bg-[#0F172A] p-2.5 sm:p-3 rounded-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs">🏷️</span>
            <div>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                የተዋሃደ የምርት ስም (በመኑ፣ በደረሰኝና በሲስተም የሚታየው):
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#F8FAFC]">
                {combinedPreview}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <span className="text-[10px] text-[#22C55E] font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20">
              ✓ ዝግጁ ነው
            </span>
          </div>
        </div>
      )}

      {/* VIRTUAL FIDEL KEYBOARD POPOVER */}
      {isKeyboardOpen && (
        <div className="p-4 bg-[#1E293B] border border-[#D4AF37]/40 rounded-2xl shadow-2xl space-y-3 animate-fadeIn">
          {/* Virtual Keyboard Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🇪🇹</span>
              <div>
                <h4 className="text-xs font-bold text-[#F8FAFC]">
                  የአማርኛ ፊደላት መጻፊያ ሰሌዳ (Amharic Virtual Keyboard)
                </h4>
                <p className="text-[10px] text-[#94A3B8]">
                  ፊደሉን ይምረጡና የ7ቱን ቤቶች ቅርጽ በመንካት ይጻፉ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsKeyboardOpen(false)}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <X size={15} />
            </button>
          </div>

          {/* Active 7 Orders Display */}
          <div className="bg-[#0F172A] p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                የ '{selectedBaseFidel.base}' ቤተሰብ ቅርጾች:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleInsertFidelChar(' ')}
                  className="px-2 py-0.5 bg-[#1E293B] hover:bg-[#2A374A] text-white rounded text-[10px] font-semibold transition"
                >
                  ክፍተት (Space)
                </button>
                <button
                  type="button"
                  onClick={handleFidelBackspace}
                  className="px-2 py-0.5 bg-[#6B1D1D] hover:bg-[#852323] text-white rounded text-[10px] font-semibold transition"
                >
                  ሰርዝ (Backspace)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {selectedBaseFidel.orders.map((char, idx) => {
                const orderNames = ['1ኛ (ግዕዝ)', '2ኛ (ካዕብ)', '3ኛ (ሣልስ)', '4ኛ (ራብዕ)', '5ኛ (ኃምስ)', '6ኛ (ሳድስ)', '7ኛ (ሳብዕ)'];
                return (
                  <button
                    key={char + idx}
                    type="button"
                    onClick={() => handleInsertFidelChar(char)}
                    className="h-11 bg-[#1E293B] hover:bg-[#D4AF37] hover:text-[#0F172A] text-[#F8FAFC] border border-white/5 hover:border-[#D4AF37] rounded-xl font-bold text-base flex flex-col items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xs"
                    title={orderNames[idx]}
                  >
                    <span>{char}</span>
                    <span className="text-[8px] opacity-60 font-normal">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base Consonants Scrollable Grid (ሀ እስከ ፐ) */}
          <div>
            <span className="block text-[10px] font-bold text-[#CBD5E1] mb-1.5 px-0.5">
              ዋና ፊደላት (ይምረጡ):
            </span>
            <div className="grid grid-cols-8 sm:grid-cols-11 gap-1 max-h-36 overflow-y-auto p-1 bg-[#0F172A]/60 rounded-xl border border-white/5">
              {AMHARIC_FIDEL_TABLE.map((row) => (
                <button
                  key={row.base}
                  type="button"
                  onClick={() => setSelectedBaseFidel(row)}
                  className={`h-8 rounded-lg font-bold text-sm transition cursor-pointer flex items-center justify-center ${
                    selectedBaseFidel.base === row.base
                      ? 'bg-[#D4AF37] text-[#0F172A] shadow-md scale-105'
                      : 'bg-[#1E293B] hover:bg-[#243244] text-[#CBD5E1] border border-white/5'
                  }`}
                >
                  {row.base}
                </button>
              ))}
            </div>
          </div>

          {/* Amharic Punctuation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#94A3B8] font-bold mr-1">ስርዓተ-ነጥብ:</span>
              {['፡', '።', '፣', '፤', '?', '-'].map((mark) => (
                <button
                  key={mark}
                  type="button"
                  onClick={() => handleInsertFidelChar(mark)}
                  className="w-7 h-7 bg-[#243244] hover:bg-[#D4AF37] hover:text-[#0F172A] text-[#CBD5E1] rounded-lg font-bold flex items-center justify-center transition"
                >
                  {mark}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsKeyboardOpen(false)}
              className="px-3 py-1 bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-[#22C55E] border border-[#22C55E]/40 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
            >
              <Check size={14} />
              <span>ጨርስ (Done)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
