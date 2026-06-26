import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, onChange, readonly, size = 'md' }: Props) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${sizes[size]} transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <i className={`fa-star ${(hover || value) >= star ? 'fa-solid text-yellow-400' : 'fa-regular text-text-muted'}`} />
        </button>
      ))}
    </div>
  );
}
