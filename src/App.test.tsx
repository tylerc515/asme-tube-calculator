import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('calculator UI', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /ASME Boiler Tube Calculator/i }),
    ).toBeInTheDocument();
  });

  it('material dropdown lists options for the selected edition', () => {
    render(<App />);
    const sel = screen.getByRole('combobox', { name: /material/i });
    expect(sel.querySelectorAll('option').length).toBeGreaterThan(10);
  });

  it('temperature input is disabled until a material is selected', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('e.g. 700')).toBeDisabled();
  });

  it('shows allowable stress after material and temperature are entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
    // SA-178-C @ 700°F US = 15600 psi
    expect(await screen.findByText(/15600/)).toBeInTheDocument();
  });

  it('calculates minimum wall thickness from P and D', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
    await user.type(screen.getByPlaceholderText('e.g. 1200'), '970');
    await user.type(screen.getAllByPlaceholderText('e.g. 2.375')[0], '2.375');
    // golden vector: P=970 D=2.375 S=15600 → t≈0.0835
    expect(await screen.findByText(/0\.083[45]/)).toBeInTheDocument();
  });

  it('switches to MAWP mode — P input becomes t input', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByPlaceholderText('e.g. 1200')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /MAWP P/i }));
    expect(screen.queryByPlaceholderText('e.g. 1200')).not.toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('e.g. 0.165')[0]).toBeInTheDocument();
  });

  it('shows an error when temperature is out of range', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '1500');
    // SA-178-C max is 1000°F — error message contains "outside the tabulated range"
    expect(await screen.findByText(/outside the tabulated range/i)).toBeInTheDocument();
  });

  it('does not show a calc result when the temperature lookup fails', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '1500');
    // Fill in calc inputs so a result would appear if S were incorrectly available
    await user.type(screen.getByPlaceholderText('e.g. 1200'), '970');
    await user.type(screen.getAllByPlaceholderText('e.g. 2.375')[0], '2.375');
    expect(await screen.findByText(/outside the tabulated range/i)).toBeInTheDocument();
    expect(screen.queryByText(/^\d+\.\d{4}$/)).not.toBeInTheDocument();
  });

  it('clears the stress badge when edition changes and the material is absent from the new edition', async () => {
    const user = userEvent.setup();
    render(<App />);
    // SA-178-D is only in asme-2015, confirmed absent from pre-1999
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-D');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
    expect(await screen.findByText(/S = \d+/)).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: /edition/i }), 'pre-1999');
    expect(screen.queryByText(/S = \d+/)).not.toBeInTheDocument();
  });

  it('e constant uses independent unit-system values, not a conversion of 0.04 in', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/e = 0\.04 in/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /SI \(MPa \/ mm\)/i }));
    // 0.04 in × 25.4 = 1.016 mm; the spec mandates 1.0 mm as an independent constant
    expect(screen.getByText(/e = 1 mm/)).toBeInTheDocument();
    expect(screen.queryByText(/1\.016/)).not.toBeInTheDocument();
  });

  it('bend "Use last result" is enabled after a valid thickness calculation', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '700');
    await user.type(screen.getByPlaceholderText('e.g. 1200'), '970');
    await user.type(screen.getAllByPlaceholderText('e.g. 2.375')[0], '2.375');
    expect(await screen.findByRole('button', { name: /use last result/i })).not.toBeDisabled();
  });

  it('bend "Use last result" is disabled when solve mode is MAWP', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /MAWP P/i }));
    expect(screen.getByRole('button', { name: /use last result/i })).toBeDisabled();
  });

  it('initially shows Calculator tab content', () => {
    render(<App />);
    expect(screen.getByRole('combobox', { name: /material/i })).toBeInTheDocument();
  });

  it('clicking Reference tab shows reference content', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /reference/i }));
    expect(screen.getByRole('heading', { name: /PG-27\.2\.1/i })).toBeInTheDocument();
  });

  it('clicking Calculator tab returns to calculator', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /reference/i }));
    await user.click(screen.getByRole('tab', { name: /calculator/i }));
    expect(screen.getByRole('combobox', { name: /material/i })).toBeInTheDocument();
  });
});
