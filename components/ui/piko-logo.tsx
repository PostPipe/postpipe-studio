'use client';

export function PikoLogo({ selected, className }: { selected?: boolean, className?: string }) {
  // Non-selected: Logo (s0) = White, Circle (s1) = Black
  // Selected: Logo (s0) = Black, Circle (s1) = White
  const logoColor = selected ? "#000000" : "#ffffff";
  const circleColor = selected ? "#ffffff" : "#000000";

  return (
    <svg 
      version="1.2" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={className}
    >
      <path 
        id="Shape 1" 
        fill={logoColor}
        d="m176.85 479.54c-48.5 17.03-142.99-320.98-42.26-403.39 76.03-62.19 200.97-63.39 259.19 16.61 35.37 48.61 41.4 125.39 0 167.96-42.98 44.19-106.73-74.66-172.36-39.35-83.98 45.18-15.03 247.8-44.57 258.17z"
      />
      <path 
        id="Shape 2" 
        fill-rule="evenodd" 
        fill={circleColor}
        d="m319.52 127.49c-17.19 0-31.09-13.9-31.09-31.1 0-17.19 13.9-31.09 31.09-31.09 17.2 0 31.1 13.9 31.1 31.09 0 17.2-13.9 31.1-31.1 31.1z"
      />
    </svg>
  );
}
