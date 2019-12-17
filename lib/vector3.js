const make = (x, y, z) => ({ x, y, z });
const add = (a, b) => make(a.x + b.x, a.y + b.y, a.z + b.z);
const round = a => make(Math.round(a.x), Math.round(a.y), Math.round(a.z));

const scale = (factor, a) => make(a.x * factor, a.y * factor, a.z * factor);

const same = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;

const distance = (a, b) => {
  const delta = add(b, scale(-1, a));
  return Math.sqrt((delta.x * delta.x) + (delta.y * delta.y) + (delta.z * delta.z));
};

const pad = v => v.toString().padStart(2, ' ');
const toString = a => `<x=${pad(a.x)}, y=${pad(a.y)}, z=${pad(a.z)}>`;
const fromString = a => {
  const attr = { x: 0, y: 1, z: 2 };
  const attributes = a.split(',')
    .reduce((vector3, value) => {
      const [axis, amount] = value.trim().replace(/[<>]/, '').split('=');
      const nextVector3 = [...vector3];
      nextVector3[attr[axis]] = Number(amount);
      return nextVector3;
    }, [0, 0, 0]);

  return make(...attributes);
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
