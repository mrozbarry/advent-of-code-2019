const buffer = require('./buffer');
const vector = require('./vector');
const intcode  = require('./intcode2');

const make = (onTile, onScore, onInput, frameDelay = 500) => {
  let tileBuffer = buffer.make(3);
  let tiles = {};

  return {
    input: {
      next: () => ({
        value: new Promise((resolve) => {
          return setTimeout(() => resolve(onInput ? onInput() : 0), frameDelay);
        }),
        done: false,
      }),
    },
    output: (value) => {
      tileBuffer = buffer.append(([x, y, tileId]) => {
        if (x === -1 && y === 0) {
          return onScore(value);
        }
        const key = vector.toString(vector.make(x, y));
        const tile = { [key]: tileId };
        tiles = { ...tiles, ...tile };
        return onTile(tile, tiles);
      }, value, tileBuffer);
    },
  }
};

const withQuarters = (count, code) => {
  const program = intcode.loadFromString(code);
  program.memory[0] = count;
  return intcode.saveToString(program);
};

module.exports = {
  make,
  withQuarters,
};
