import { describe, expect, it } from 'vitest';
import { displayName, slugify } from './slug';

describe('displayName', () => {
  it('returns the trimmed value when non-empty', () => {
    expect(displayName('Boiler A')).toBe('Boiler A');
  });

  it('falls back to "Untitled set" for empty string', () => {
    expect(displayName('')).toBe('Untitled set');
  });

  it('treats all-spaces as empty', () => {
    expect(displayName('   ')).toBe('Untitled set');
  });
});

describe('slugify', () => {
  it('converts a basic name to a slug', () => {
    expect(slugify('Boiler A')).toBe('boiler-a');
  });

  it('empty string falls back to "untitled-set"', () => {
    expect(slugify('')).toBe('untitled-set');
  });

  it('all-spaces falls back to "untitled-set"', () => {
    expect(slugify('   ')).toBe('untitled-set');
  });

  it('only-special-chars falls back to "untitled-set"', () => {
    expect(slugify('!!!')).toBe('untitled-set');
  });

  it('strips special characters before slugifying', () => {
    expect(slugify('Unit #1 (Test!)')).toBe('unit-1-test');
  });

  it('retains hyphens', () => {
    expect(slugify('Set-A')).toBe('set-a');
  });

  it('collapses multiple spaces to a single hyphen', () => {
    expect(slugify('Boiler   A')).toBe('boiler-a');
  });

  it('truncates slug to 60 characters, not the display name', () => {
    const long = 'a'.repeat(80);
    expect(slugify(long)).toHaveLength(60);
    expect(displayName(long)).toHaveLength(80);
  });
});
