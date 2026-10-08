export const showValue = (value: unknown) =>
  value === undefined ? "(removed)" : JSON.stringify(value, null, 2);
