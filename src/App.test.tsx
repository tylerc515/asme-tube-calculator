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
    await user.type(screen.getByPlaceholderText('e.g. 2.375'), '2.375');
    // golden vector: P=970 D=2.375 S=15600 → t≈0.0835
    expect(await screen.findByText(/0\.083[45]/)).toBeInTheDocument();
  });

  it('switches to MAWP mode — P input becomes t input', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByPlaceholderText('e.g. 1200')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /MAWP P/i }));
    expect(screen.queryByPlaceholderText('e.g. 1200')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 0.165')).toBeInTheDocument();
  });

  it('shows an error when temperature is out of range', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByRole('combobox', { name: /material/i }), 'SA-178-C');
    await user.type(screen.getByPlaceholderText('e.g. 700'), '1500');
    // SA-178-C max is 1000°F — error message contains "outside the tabulated range"
    expect(await screen.findByText(/outside the tabulated range/i)).toBeInTheDocument();
  });
});
