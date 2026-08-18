import React from 'react';

interface ToothIconProps {
  className?: string;
  size?: number;
  variant?: 'solid' | 'outline' | 'badge';
}

export const ToothIcon: React.FC<ToothIconProps> = ({
  className = 'w-6 h-6',
  size,
  variant = 'solid',
}) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  if (variant === 'badge') {
    return (
      <div
        className={`rounded-xl bg-[#ffd200] text-[#005581] flex items-center justify-center shadow-md ring-2 ring-white/30 shrink-0 ${className}`}
        style={sizeStyle}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3/5 h-3/5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C8.5 2 6 4 6 7.5C6 11 7.2 13.5 8 16.5C8.8 19.5 9.5 22 10.5 22C11.5 22 12 19 12 17C12 19 12.5 22 13.5 22C14.5 22 15.2 19.5 16 16.5C16.8 13.5 18 11 18 7.5C18 4 15.5 2 12 2ZM9 6.5C9.5 5.5 10.5 5 12 5C13.5 5 14.5 5.5 15 6.5C14 6 13 5.8 12 5.8C11 5.8 10 6 9 6.5Z" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill={variant === 'solid' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={variant === 'outline' ? 2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={sizeStyle}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C8.5 2 6 4 6 7.5C6 11 7.2 13.5 8 16.5C8.8 19.5 9.5 22 10.5 22C11.5 22 12 19 12 17C12 19 12.5 22 13.5 22C14.5 22 15.2 19.5 16 16.5C16.8 13.5 18 11 18 7.5C18 4 15.5 2 12 2ZM9 6.5C9.5 5.5 10.5 5 12 5C13.5 5 14.5 5.5 15 6.5C14 6 13 5.8 12 5.8C11 5.8 10 6 9 6.5Z" />
    </svg>
  );
};
