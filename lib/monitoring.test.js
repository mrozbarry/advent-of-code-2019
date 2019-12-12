const test = require('ava');
const monitoring = require('./monitoring');

test('can load a map from a string', (t) => {
  const map = `.#..#
.....
#####
....#
...##`;

  t.deepEqual(monitoring.loadFromString(map), [
    { x: 1, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
  ]);
});
