const make = (x, y) => ({ x, y });
const add = (a, b) => make(a.x + b.x, a.y + b.y);
const round = a => make(Math.round(a.x), Math.round(a.y));

const scale = (factor, a) => make(a.x * factor, a.y * factor);

const same = (a, b) => a.x === b.x && a.y === b.y;

const distance = (a, b) => {
  const delta = add(b, scale(-1, a));
  return Math.sqrt((delta.x * delta.x) + (delta.y * delta.y));
};

const toString = a => `${a.x},${a.y}`;
const fromString = a => {
  const [x, y] = a.split(',').map(Number);
  return make(x, y);
};

module.exports = {
  make,
  add,
  scale,
  round,
  same,
  distance,
  toString,
  fromString,
};
