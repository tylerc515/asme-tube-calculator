import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReferenceTab } from './ReferenceTab';

describe('ReferenceTab', () => {
  it('renders the PG-27.2.1 heading', () => {
    render(<ReferenceTab />);
    expect(screen.getByRole('heading', { name: /PG-27\.2\.1/i })).toBeInTheDocument();
  });

  it('renders the torus bend check heading', () => {
    render(<ReferenceTab />);
    expect(screen.getByRole('heading', { name: /torus bend check/i })).toBeInTheDocument();
  });

  it('edition table contains both design factors', () => {
    render(<ReferenceTab />);
    expect(screen.getByRole('cell', { name: /3\.5/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /4\.0/ })).toBeInTheDocument();
  });

  it('materials table has Spec, Grade, Product Form headers', () => {
    render(<ReferenceTab />);
    expect(screen.getByRole('columnheader', { name: /^spec$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^grade$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /product form/i })).toBeInTheDocument();
  });

  it('materials table has at least one data row', () => {
    render(<ReferenceTab />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });

  it('SA-178 appears in the materials table', () => {
    render(<ReferenceTab />);
    const cells = screen.getAllByRole('cell', { name: /SA-178/i });
    expect(cells.length).toBeGreaterThan(0);
  });
});
