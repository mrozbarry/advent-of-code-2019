const test = require('ava');
const image = require('./image');

test('sample 1 checksum', (t) => {
  const layers = image.layers(3, 2, 123456789012);

  t.deepEqual(layers, [
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
    [
      [7, 8, 9],
      [0, 1, 2],
    ]
  ])
});
