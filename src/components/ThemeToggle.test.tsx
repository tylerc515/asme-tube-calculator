import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders a button for each of system, light and dark', () => {
    render(<ThemeToggle theme="system" setTheme={() => {}} />);
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  it('marks only the active theme as pressed', () => {
    render(<ThemeToggle theme="light" setTheme={() => {}} />);
    expect(screen.getByRole('button', { name: /light/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /system/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reports the chosen theme when a button is clicked', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    render(<ThemeToggle theme="system" setTheme={setTheme} />);
    await user.click(screen.getByRole('button', { name: /dark/i }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('exposes the group under an accessible label', () => {
    render(<ThemeToggle theme="system" setTheme={() => {}} />);
    expect(screen.getByRole('group', { name: /color theme/i })).toBeInTheDocument();
  });
});
