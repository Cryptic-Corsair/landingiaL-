export interface TopBarProps {
  onEnterClick: () => void;
}

export function TopBar({ onEnterClick }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 py-5 sm:py-6 pointer-events-none">
      <a
        href="#beat-01"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="pointer-events-auto font-sans text-xs sm:text-[13px] font-medium tracking-[0.26em] uppercase text-[#FFF6EA] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4BEFF]"
      >
        IAL CHEM
      </a>

      <button
        type="button"
        onClick={onEnterClick}
        className="pointer-events-auto font-mono text-xs tracking-[0.08em] text-[#FFF6EA] px-4 py-2 rounded-full whitespace-nowrap shrink-0 transition-colors duration-200 hover:bg-[#FFF6EA]/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4BEFF] cursor-pointer"
        style={{ border: '1px solid rgba(255, 246, 234, 0.18)' }}
      >
        [ Enter ]
      </button>
    </header>
  );
}
