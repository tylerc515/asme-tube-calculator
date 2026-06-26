import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BendCalculator } from './BendCalculator';

describe('BendCalculator', () => {
  it('renders the "not PG-27.2.1" label', () => {
    render(<BendCalculator unitSystem="US" />);
    expect(screen.getByText(/not PG-27.2.1/i)).toBeInTheDocument();
  });

  it('"Use last result" is disabled when lastT is undefined', () => {
    render(<BendCalculator unitSystem="US" />);
    expect(screen.getByRole('button', { name: /use last result/i })).toBeDisabled();
  });

  it('"Use last result" is enabled and fills t when lastT is provided', async () => {
    const user = userEvent.setup();
    render(<BendCalculator unitSystem="US" lastT={0.0835} />);
    const btn = screen.getByRole('button', { name: /use last result/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    // lastT.toFixed(4) === "0.0835"; type="number" input, toHaveValue returns numeric 0.0835
    expect(screen.getByPlaceholderText(/e\.g\. 0\.165/i)).toHaveValue(0.0835);
  });

  it('shows result after valid inputs are entered', async () => {
    const user = userEvent.setup();
    render(<BendCalculator unitSystem="SI" />);
    // P22 golden vector converted to mm: D=41.275, t=3.81, R=101.6
    await user.type(screen.getByPlaceholderText(/e\.g\. 4\.5/i), '3.81');
    await user.type(screen.getByPlaceholderText(/e\.g\. 51/i), '41.275');
    await user.type(screen.getByPlaceholderText(/e\.g\. 76\.5/i), '101.6');
    expect(await screen.findByText(/Y =/i)).toBeInTheDocument();
  });

  it('show work toggle reveals r and Y steps', async () => {
    const user = userEvent.setup();
    render(<BendCalculator unitSystem="SI" />);
    await user.type(screen.getByPlaceholderText(/e\.g\. 4\.5/i), '3.81');
    await user.type(screen.getByPlaceholderText(/e\.g\. 51/i), '41.275');
    await user.type(screen.getByPlaceholderText(/e\.g\. 76\.5/i), '101.6');
    await user.click(await screen.findByRole('button', { name: /show work/i }));
    expect(screen.getByText('r')).toBeInTheDocument();
    // <dt>Y</dt> has exact text 'Y'; result-label 'Y =' does not match exact 'Y'
    expect(screen.getAllByText('Y').length).toBeGreaterThan(0);
  });
});
