import { useState, useRef } from 'react';

interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top - 8, left: r.left + r.width / 2 });
    }
    setVisible(true);
  }

  return (
    <>
      <span
        ref={ref}
        className="tooltip-badge"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        onFocus={show}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        aria-label={text}
      >
        ?
      </span>
      {visible && (
        <span className="tooltip-bubble" style={{ top: pos.top, left: pos.left }}>
          {text}
        </span>
      )}
    </>
  );
}
