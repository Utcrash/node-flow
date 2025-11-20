import React from 'react';

// Render icon from class name (supports custom icon font and emojis)
export const getIconFromClassName = (iconClassName: string): React.ReactNode => {
  if (!iconClassName || typeof iconClassName !== 'string') {
    return <i className="ni ni-process"></i>; // Default icon
  }

  // If it's already an emoji (single character or emoji), return it
  if (iconClassName.length <= 4 && !iconClassName.includes(' ') && !iconClassName.includes('-')) {
    return iconClassName;
  }

  // If it's a custom icon class (e.g., "ni ni-timer"), render it directly
  if (iconClassName.includes('ni ')) {
    return <i className={iconClassName}></i>;
  }

  // Default to treating it as an icon class
  return <i className={iconClassName}></i>;
};

