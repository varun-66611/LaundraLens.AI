const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const trim = (value: number) => value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');

export const formatINR = (value: number) => inr.format(value);

export const formatINRCompact = (value: number) => {
  if (Math.abs(value) >= 10_000_000) return `₹${trim(value / 10_000_000)} Cr`;
  if (Math.abs(value) >= 100_000) return `₹${trim(value / 100_000)} L`;
  return formatINR(value);
};
