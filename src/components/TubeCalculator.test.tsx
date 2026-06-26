import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TubeCalculator } from './TubeCalculator';

async function fillThickness(user: ReturnType<typeof userEvent.setup>, P: string) {
  await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
  await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
  await user.type(screen.getByPlaceholderText('e.g. 1200'), P);
  await user.type(screen.getAllByPlaceholderText('e.g. 2.375')[0], '2.375');
}

describe('TubeCalculator Show Work', () => {
  it('Show Work button absent before a valid result', () => {
    render(<TubeCalculator />);
    expect(screen.queryByRole('button', { name: /show work/i })).not.toBeInTheDocument();
  });

  it('Show Work button appears after a valid thickness result', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    await fillThickness(user, '970');
    expect(await screen.findByRole('button', { name: /show work/i })).toBeInTheDocument();
  });

  it('clicking Show Work reveals thickness step rows', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    await fillThickness(user, '970');
    await user.click(await screen.findByRole('button', { name: /show work/i }));
    expect(screen.getByText('PD / (2Sw + P)')).toBeInTheDocument();
    expect(screen.getByText('0.005D')).toBeInTheDocument();
    expect(screen.getByText('e (input)')).toBeInTheDocument();
  });

  it('clicking Show Work again hides the steps', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    await fillThickness(user, '970');
    await user.click(await screen.findByRole('button', { name: /show work/i }));
    await user.click(screen.getByRole('button', { name: /hide work/i }));
    expect(screen.queryByText('PD / (2Sw + P)')).not.toBeInTheDocument();
  });

  it('MAWP mode Show Work reveals numerator and Sw rows', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
    await user.click(screen.getByRole('button', { name: /MAWP P/i }));
    await user.type(screen.getAllByPlaceholderText('e.g. 0.165')[0], '0.165');
    await user.type(screen.getAllByPlaceholderText('e.g. 2.375')[0], '2.375');
    await user.click(await screen.findByRole('button', { name: /show work/i }));
    expect(screen.getByText('2t − 0.01D − 2e')).toBeInTheDocument();
    expect(screen.getByText('Sw')).toBeInTheDocument();
  });
});

describe('TubeCalculator practical minimum note', () => {
  it('note absent when result is at or above 0.125 in', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    // P=2000, D=2.375, SA-178-C @ 700°F → t ≈ 0.155 in (above 0.125)
    await fillThickness(user, '2000');
    await screen.findByText(/0\.15[0-9]/);
    expect(screen.queryByText(/manufacturing minimum/i)).not.toBeInTheDocument();
  });

  it('note appears when result is below 0.125 in', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    // P=970, D=2.375, SA-178-C @ 700°F → t ≈ 0.0835 in (below 0.125)
    await fillThickness(user, '970');
    expect(await screen.findByText(/manufacturing minimum/i)).toBeInTheDocument();
  });

  it('note absent in MAWP mode regardless of result', async () => {
    const user = userEvent.setup();
    render(<TubeCalculator />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
    await user.click(screen.getByRole('button', { name: /MAWP P/i }));
    await user.type(screen.getAllByPlaceholderText('e.g. 0.165')[0], '0.165');
    await user.type(screen.getAllByPlaceholderText('e.g. 2.375')[0], '2.375');
    await screen.findByText(/P =/);
    expect(screen.queryByText(/manufacturing minimum/i)).not.toBeInTheDocument();
  });
});
