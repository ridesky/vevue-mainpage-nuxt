import BigNumber from 'bignumber.js';

export function integerToDecimal(integer, unit) {
  if (new BigNumber(integer).isNaN()) {
    return null;
  }
  return new BigNumber(integer).shiftedBy(-unit).toFixed();
}

export function decimalToInteger(decimal, unit) {
  if (new BigNumber(decimal).isNaN()) {
    return null;
  }
  return new BigNumber(decimal)
    .shiftedBy(unit)
    .dp(0)
    .toFixed();
}
