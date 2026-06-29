import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('shows bubble text on mouse enter', () => {
    render(<Tooltip text="some tip" />);
    fireEvent.mouseEnter(screen.getByText('?'));
    expect(screen.getByText('some tip')).toBeInTheDocument();
  });
});
