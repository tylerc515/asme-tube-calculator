import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders the badge character', () => {
    render(<Tooltip text="some tip" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('sets aria-label to the tooltip text', () => {
    render(<Tooltip text="some tip" />);
    expect(screen.getByLabelText('some tip')).toBeInTheDocument();
  });

  it('sets data-tip attribute to the tooltip text', () => {
    render(<Tooltip text="some tip" />);
    expect(screen.getByText('?')).toHaveAttribute('data-tip', 'some tip');
  });
});
