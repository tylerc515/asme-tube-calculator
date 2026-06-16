import type { LogRow, LogStore } from './LogStore';

export class MemoryLogStore implements LogStore {
  private rows: LogRow[] = [];
  private name = '';

  add(row: LogRow): void {
    this.rows.push({ ...row });
  }

  getAll(): readonly LogRow[] {
    return [...this.rows];
  }

  clear(): void {
    this.rows = [];
  }

  setName(name: string): void {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}
