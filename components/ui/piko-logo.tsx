'use client';

export function PikoLogo({ selected, className }: { selected?: boolean, className?: string }) {
  const src = "/piko_logo_white.svg";

  return (
    <img 
      src={src}
      alt="Piko Logo"
      className={className}
      style={{ display: 'block' }}
    />
  );
}
