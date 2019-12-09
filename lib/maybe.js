const Just = Symbol('just');
const Nothing = Symbol('nothing');

const just = value => [Just, value];
const nothing = () => [Nothing];

const match = (cases, value) => {
  const fn = cases[value[0]];
  if (typeof fn === 'function') {
    return fn(value[1]);
  }
  return value[1];
};

const withDefault = (fallback, value) => match({
  [Just]: v => v,
  [Nothing]: () => fallback,
}, value);

module.exports = {
  Just,
  Nothing,

  just,
  nothing,

  match,
  withDefault,
};
