interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  return (
    <span className="tooltip-wrap" data-tip={text} tabIndex={0} aria-label={text}>
      ?
    </span>
  );
}
