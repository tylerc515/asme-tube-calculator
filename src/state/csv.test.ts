import { describe, expect, it, beforeEach } from 'vitest';
import type { LogRow } from './LogStore';
import { MemoryLogStore } from './MemoryLogStore';
import { toCSV } from './csv';

const FIXED_TIME = '2026-06-16T12:00:00.000Z';

function makeRow(overrides: Partial<LogRow> = {}): LogRow {
  return {
    timestamp: '2026-01-01T00:00:00.000Z',
    setName: 'Test set',
    unitSystem: 'US',
    edition: 'asme-2015',
    materialId: 'SA-178-C',
    tempF: 700,
    S: 15600,
    sSource: 'table',
    solveMode: 'thickness',
    P: 970,
    t: 0.0835,
    D: 2.375,
    w: 1,
    e: 0,
    ...overrides,
  };
}

describe('toCSV — metadata rows', () => {
  let store: MemoryLogStore;

  beforeEach(() => {
    store = new MemoryLogStore();
    store.setName('Boiler test');
    store.add(makeRow());
  });

  it('row 0 is the set name', () => {
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines[0]).toBe('Set name,Boiler test');
  });

  it('row 1 contains the export timestamp', () => {
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines[1]).toContain(FIXED_TIME);
  });

  it('row 1 contains the edition', () => {
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines[1]).toContain('asme-2015');
  });

  it('row 2 is blank', () => {
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines[2]).toBe('');
  });

  it('row 3 is the header with units in brackets (US)', () => {
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines[3]).toContain('D (in)');
    expect(lines[3]).toContain('S (psi)');
    expect(lines[3]).toContain('P (psi)');
    expect(lines[3]).toContain('t (in)');
    expect(lines[3]).toContain('e (in)');
  });

  it('header uses SI units when first row is SI', () => {
    const siStore = new MemoryLogStore();
    siStore.add(makeRow({ unitSystem: 'SI', S: 107.55 }));
    const lines = toCSV(siStore, FIXED_TIME).split('\n');
    expect(lines[3]).toContain('D (mm)');
    expect(lines[3]).toContain('S (MPa)');
    expect(lines[3]).toContain('P (MPa)');
    expect(lines[3]).toContain('t (mm)');
  });

  it('set name falls back to "Untitled set" when name is empty', () => {
    const unnamed = new MemoryLogStore();
    unnamed.add(makeRow());
    const lines = toCSV(unnamed, FIXED_TIME).split('\n');
    expect(lines[0]).toBe('Set name,Untitled set');
  });

  it('set name containing a comma is RFC 4180 quoted', () => {
    const s = new MemoryLogStore();
    s.setName('Unit A, B');
    s.add(makeRow());
    const lines = toCSV(s, FIXED_TIME).split('\n');
    expect(lines[0]).toBe('Set name,"Unit A, B"');
  });
});

describe('toCSV — data rows', () => {
  let store: MemoryLogStore;

  beforeEach(() => {
    store = new MemoryLogStore();
    store.setName('Test');
  });

  it('data row appears at index 4', () => {
    store.add(makeRow({ materialId: 'SA-178-C', tempF: 700 }));
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines[4]).toContain('SA-178-C');
    expect(lines[4]).toContain('700');
  });

  it('exports one data row per logged entry', () => {
    store.add(makeRow());
    store.add(makeRow());
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines).toHaveLength(6);
  });

  it('empty store produces only the four header lines', () => {
    const lines = toCSV(store, FIXED_TIME).split('\n');
    expect(lines).toHaveLength(4);
  });
});
