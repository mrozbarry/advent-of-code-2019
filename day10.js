const path = require('path');
const monitoring = require('./lib/monitoring');
const vector = require('./lib/vector');

const asteroidsMap = path.resolve(__dirname, 'day10.asteroidMap');

const part1 = (asteroids) => {
  const result = monitoring.bestOutpostLocation(asteroids);
  console.log('part1', result.count);
};

const part2 = (asteroids) => {
  const outpost = monitoring.bestOutpostLocation(asteroids);
  const station = vector.fromString(outpost.position);
  const result = monitoring.vaporizeCountAsteroids(station, 200, asteroids);
  console.log('part2', result.slice(-1));
}

monitoring.loadFromFile(asteroidsMap)
  .then((asteroids) => {
    part1(asteroids);
    part2(asteroids);
  });
