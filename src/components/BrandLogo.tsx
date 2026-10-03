import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  showMotto?: boolean;
  responsiveHideText?: boolean; // Hides PILOTEHUB+ text on mobile (< sm)
  responsiveHideMotto?: boolean; // Hides Reach Higher • Achieve More motto on screens near mobile (< lg)
  textClassName?: string;
  mottoClassName?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'full-crest';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showMotto = true,
  responsiveHideText = false,
  responsiveHideMotto = false,
  textClassName = '',
  mottoClassName = '',
  className = '',
  variant = 'light',
}) => {
  const [crestSrc, setCrestSrc] = useState<string>('/Pilotehubplus.webp');

  const sizeMap = {
    xs: { icon: 28, text: 'text-sm', sub: 'text-[7px]', shieldW: 28, shieldH: 28 },
    sm: { icon: 36, text: 'text-base sm:text-lg', sub: 'text-[8px] sm:text-[9px]', shieldW: 38, shieldH: 38 },
    md: { icon: 46, text: 'text-lg sm:text-xl', sub: 'text-[9px] sm:text-[10px]', shieldW: 52, shieldH: 52 },
    lg: { icon: 64, text: 'text-2xl sm:text-3xl', sub: 'text-xs', shieldW: 72, shieldH: 72 },
    xl: { icon: 86, text: 'text-3xl sm:text-4xl', sub: 'text-sm', shieldW: 94, shieldH: 94 },
    hero: { icon: 120, text: 'text-4xl sm:text-5xl', sub: 'text-base', shieldW: 130, shieldH: 130 },
  };

  const isDarkCanvas = variant === 'dark';
  const isFullCrest = variant === 'full-crest';

  const CrestEmblem = (
    <img
      src={crestSrc}
      alt="Pilotehub+ Crest"
      onError={() => {
        if (crestSrc === '/Pilotehubplus.webp') {
          setCrestSrc('/Pilotehubplus.png');
        } else if (crestSrc === '/Pilotehubplus.png') {
          setCrestSrc('/Pilotehubplus.jpg');
        } else if (crestSrc === '/Pilotehubplus.jpg') {
          setCrestSrc('/Pilotehubplus.svg');
        } else if (crestSrc === '/Pilotehubplus.svg') {
          setCrestSrc('/Pilotehubplus-favicon.svg');
        }
      }}
      className="w-full h-full object-contain rounded-xl drop-shadow-md"
      referrerPolicy="no-referrer"
    />
  );

  if (isFullCrest) {
    return (
      <div className={`flex flex-col items-center select-none text-center ${className}`}>
        {/* Top Heraldic Crest */}
        <div style={{ width: sizeMap[size].shieldW * 1.5, height: sizeMap[size].shieldH * 1.5 }}>
          {CrestEmblem}
        </div>

        {/* Display Typography */}
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center tracking-[0.12em] font-serif-display font-black text-2xl sm:text-3xl">
            <span className={isDarkCanvas ? 'text-white' : 'text-[#0A1628]'}>PILOTE</span>
            <span className="text-[#C9A84C] ml-0.5">HUB+</span>
          </div>

          {/* Diamond Separator Line */}
          <div className="flex items-center gap-2 my-2 w-full max-w-[200px]">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[10px]">◆</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C9A84C]" />
          </div>

          {/* Motto */}
          <span className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-[0.25em] text-[#C9A84C]">
            Reach Higher. Achieve More.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Crest Icon */}
      <div
        className="relative flex items-center justify-center transition-transform hover:scale-105 flex-shrink-0"
        style={{ width: sizeMap[size].icon, height: sizeMap[size].icon }}
      >
        {CrestEmblem}
      </div>

      {showText && (
        <div className={`flex flex-col ${responsiveHideText ? 'hidden sm:flex' : ''} ${textClassName}`}>
          <div className="flex items-center leading-none">
            <span
              className={`font-serif-display font-black tracking-wide ${sizeMap[size].text} ${
                isDarkCanvas ? 'text-white' : 'text-[#0A1628]'
              }`}
            >
              PILOTE
            </span>
            <span className={`font-serif-display font-black text-[#C9A84C] ${sizeMap[size].text}`}>
              HUB+
            </span>
          </div>

          {showMotto && (
            <span
              className={`font-serif tracking-[0.18em] uppercase font-bold text-[#C9A84C] mt-1 ${sizeMap[size].sub} ${
                responsiveHideMotto ? 'hidden lg:block' : ''
              } ${mottoClassName}`}
            >
              Reach Higher • Achieve More
            </span>
          )}
        </div>
      )}
    </div>
  );
};
