const path = require('path');
const maybe = require('./lib/maybe');
const image = require('./lib/image');

const file = path.resolve(__dirname, 'day8.spaceimage');

const countDigits = (digit, layer) => {
  return [].concat(...layer).filter(num => num === digit).length;
};

const part1 = async (data) => {
  const layers = image.layers(25, 6, data);

  const stats = layers.reduce((maybeStats, layer, idx) => {
    const layerZeros = countDigits(0, layer);
    const current = { zeros: layerZeros, index: idx };
    return maybe.just(maybe.match({
      [maybe.Just]: ({ zeros, index }) => {
        return layerZeros < zeros
          ? current
          : { zeros, index };
      },
      [maybe.Nothing]: () => current,
    }, maybeStats));
  }, maybe.nothing())

  const layerIndex = maybe.match({ [maybe.Just]: ({ index }) => index }, stats);
  const target = layers[layerIndex];
  if (!target) return undefined;

  console.log(target);

  return countDigits(1, target) * countDigits(2, target);
};

image.readFromFile(file)
  .then(async (data) => {
    await part1(data).then((calculation) => console.log('Part 1:', calculation));
    await image.render(25, 6, data);
  });
