export const parseToMs = (expiryStr: string): number => {
  const match = expiryStr.match(/^(\d+)([a-z]+)$/i);
  if (!match) throw new Error(`Invalid expiry format: ${expiryStr}`);

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const unitMap: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  const multiplier = unitMap[unit];
  if (!multiplier) throw new Error(`Unknown time unit: ${unit}`);

  return value * multiplier;
};