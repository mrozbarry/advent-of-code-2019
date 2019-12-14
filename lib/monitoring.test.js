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

test('day 10 sample 1', (t) => {
  const asteroids = monitoring.loadFromString(`......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`);
  t.deepEqual(monitoring.bestOutpostLocation(asteroids), { count: 33, position: '5,8' });
});

test('day 10 sample 2', (t) => {
  const asteroids = monitoring.loadFromString(`#.#...#.#.
.###....#.
.#....#...
##.#.#.#.#
....#.#.#.
.##..###.#
..#...##..
..##....##
......#...
.####.###.`);

  t.deepEqual(monitoring.bestOutpostLocation(asteroids), { count: 35, position: '1,2' });
});

test('day 10 sample 3', (t) => {
  const asteroids = monitoring.loadFromString(`.#..#..###
####.###.#
....###.#.
..###.##.#
##.##.#.#.
....###..#
..#.#..#.#
#..#.#.###
.##...##.#
.....#.#..`);

  t.deepEqual(monitoring.bestOutpostLocation(asteroids), { count: 41, position: '6,3' });
});

test('day 10 sample 4', (t) => {
  const asteroids = monitoring.loadFromString(`.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`);

  t.deepEqual(monitoring.bestOutpostLocation(asteroids), { count: 210, position: '11,13' });
});

test('day 10 part 2 sample target order', (t) => {
  const asteroids = monitoring.loadFromString(`.#....#####...#..
##...##.#####..##
##...#...#.#####.
..#.........###..
..#.#.....#....##`);
  const station = { x: 8, y: 3 };

  const expectations = [
    { x: 8, y: 1 },
    { x: 9, y: 0 },
    { x: 9, y: 1 },
  ];

  const vaporizations = monitoring.vaporizeCountAsteroids(station, expectations.length, asteroids);
  t.deepEqual(vaporizations, expectations);
})
