export type CounterValue = {
  value: number;
  suffix: string;
};

/** Convert a CMS value such as "1,200+" into the numeric odometer props. */
export function parseCounterValue(input: string): CounterValue | null {
  const match = input.match(/^([\d,]+)(.*)$/);
  if (!match) return null;

  const value = Number(match[1].replaceAll(",", ""));
  if (!Number.isFinite(value)) return null;

  return { value, suffix: match[2] };
}
