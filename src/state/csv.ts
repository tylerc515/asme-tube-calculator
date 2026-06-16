import type { LogStore } from './LogStore';
import { displayName } from './slug';

function csvField(value: string | number): string {
  const s = String(value);
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(fields: (string | number)[]): string {
  return fields.map(csvField).join(',');
}

export function toCSV(store: LogStore, exportedAt = new Date().toISOString()): string {
  const rows = store.getAll();
  const name = displayName(store.getName());
  const unitSystem = rows.length > 0 ? rows[0].unitSystem : 'US';
  const edition = rows.length > 0 ? rows[0].edition : '';
  const pUnit = unitSystem === 'US' ? 'psi' : 'MPa';
  const lUnit = unitSystem === 'US' ? 'in' : 'mm';

  const lines: string[] = [
    csvRow(['Set name', name]),
    csvRow(['Exported', exportedAt, edition]),
    '',
    csvRow([
      'Timestamp',
      'Edition',
      'Material',
      'Temp (°F)',
      `S (${pUnit})`,
      'S source',
      'Mode',
      `P (${pUnit})`,
      `t (${lUnit})`,
      `D (${lUnit})`,
      'w',
      `e (${lUnit})`,
    ]),
    ...rows.map((r) =>
      csvRow([
        r.timestamp,
        r.edition,
        r.materialId,
        r.tempF,
        r.S,
        r.sSource,
        r.solveMode,
        r.P,
        r.t,
        r.D,
        r.w,
        r.e,
      ]),
    ),
  ];

  return lines.join('\n');
}
