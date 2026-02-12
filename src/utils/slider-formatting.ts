
export const formatCurrency = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value.toLocaleString()}`;
};

export const formatHourlyRate = (value: number): string => {
  return `$${value}/hr`;
};

export const formatGuestCount = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return value.toLocaleString();
};

export const formatPricePerPerson = (value: number): string => {
  return `$${value}/person`;
};

export const formatVenuePrice = (value: number): string => {
  if (value >= 5000) {
    return `$${(value / 1000).toFixed(0)}k+`;
  }
  return formatCurrency(value);
};
