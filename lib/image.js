const { read } = require('./file');
const { black, white, magenta } = require('colorette');

const layers = (width, height, input) => {
  const data = input.toString().split('');
  const layers = [];
  while (data.length > 0) {
    const layer = [];
    for(let y = 0; y < height; y++) {
      const row = [];
      for(let x = 0; x < width; x++) {
        row.push(Number(data.shift()));
      }
      layer.push(row);
    }
    layers.push(layer);
  }
  return layers;
};

const COLORS = {
  BLACK: 0,
  WHITE: 1,
  TRANSPARENT: 2,
};

const OPAQUE_COLORS = [COLORS.BLACK, COLORS.WHITE];

const toBuffer = (width, height, input) => {
  const data = layers(width, height, input);

  const buffer = Array.from({ length: width * height }, () => ' ');

  for(let y = 0; y < height; y++) {
    for(let x = 0; x < width; x++) {
      const index = y * width + x;
      for(const layer of data) {
        const color = layer[y][x];
        if (OPAQUE_COLORS.includes(color)) {
          buffer[index] = color;
          break;
        }
      }
    }
  }

  return buffer;
};

const render = (width, height, input) => {
  const buffer = toBuffer(width, height, input);
  let remaining = [...buffer];
  while (remaining.length > 0) {
    const row = remaining
      .slice(0, width)
      .map(c => {
        switch (c) {
          case COLORS.BLACK:
            return black('█');
          case COLORS.WHITE:
            return white('█');
          default:
            return magenta('░');
        }
      })
      .join('');

    console.log(row);

    remaining = remaining.slice(width);
  }
}

const readFromFile = file => read(file).then(d => d.trim());

module.exports = {
  layers,
  render,
  readFromFile,
};
