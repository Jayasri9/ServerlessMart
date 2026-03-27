// Currency utility functions
export const formatCurrency = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₹${num.toFixed(2)}`;
};

export const formatCurrencyWithSymbol = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₹${num}`;
};
