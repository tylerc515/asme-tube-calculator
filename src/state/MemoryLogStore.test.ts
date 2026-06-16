import { describe, expect, it, beforeEach } from 'vitest';
import type { LogRow } from './LogStore';
import { MemoryLogStore } from './MemoryLogStore';

function makeRow(overrides: Partial<LogRow> = {}): LogRow {
  return {
    timestamp: '2026-01-01T00:00:00.000Z',
    setName: 'test set',
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

describe('MemoryLogStore', () => {
  let store: MemoryLogStore;

  beforeEach(() => {
    store = new MemoryLogStore();
  });

  it('starts empty', () => {
    expect(store.getAll()).toHaveLength(0);
  });

  it('round-trips add and getAll', () => {
    const row = makeRow();
    store.add(row);
    expect(store.getAll()).toHaveLength(1);
    expect(store.getAll()[0]).toEqual(row);
  });

  it('preserves insertion order', () => {
    store.add(makeRow({ tempF: 700 }));
    store.add(makeRow({ tempF: 800 }));
    const rows = store.getAll();
    expect(rows[0].tempF).toBe(700);
    expect(rows[1].tempF).toBe(800);
  });

  it('clear removes all rows', () => {
    store.add(makeRow());
    store.clear();
    expect(store.getAll()).toHaveLength(0);
  });

  it('setName and getName round-trip', () => {
    store.setName('my set');
    expect(store.getName()).toBe('my set');
  });

  it('getName returns empty string before setName is called', () => {
    expect(store.getName()).toBe('');
  });

  it('records unit system per row, not globally', () => {
    store.add(makeRow({ unitSystem: 'US' }));
    store.add(makeRow({ unitSystem: 'SI' }));
    const rows = store.getAll();
    expect(rows[0].unitSystem).toBe('US');
    expect(rows[1].unitSystem).toBe('SI');
  });

  it('stored row is independent of the original object', () => {
    const row = makeRow({ t: 0.0835 });
    store.add(row);
    row.t = 999;
    expect(store.getAll()[0].t).toBe(0.0835);
  });
});
