const { read } = require('./file');
const vector = require('./vector');
const maybe = require('./maybe');

const loadFromString = map => {
  return map.split('\n').reduce((asteroids, line, y) => {
    return [
      ...asteroids,
      ...line.split('').reduce((asteroidLine, text, x) => {
        const asteroid = text === '#'
          ? [vector.make(x, y)]
          : []

        return [...asteroidLine, ...asteroid];
      }, [])
    ];
  }, []);
};

const loadFromFile = file => read(file).then(data => loadFromString(data.trim()))

const slope = (a, b) => (b.y - a.y) / (b.x - a.x);
const between = (v1, v2, a) => {
  const min = Math.min(v1, v2);
  const max = Math.max(v1, v2);

  return a >= min && a <= max;
};


const isPointOnLine = ([a, b], c) => {
  const lineSlope = slope(a, b);
  const pointSlope = slope(a, c);

  if (lineSlope !== pointSlope) {
    return false;
  }

  return between(a.x, b.x, c.x) && between(a.y, b.y, c.y);
};

const hasLineOfSight = (a, b, asteroids) => {
  const line = [a, b];

  return asteroids
    .filter(asteroid => asteroid !== a && asteroid !== b)
    .filter(asteroid => isPointOnLine(line, asteroid))
    .length === 0;
};

const lineOfSightCount = (a, asteroids) => {
  return asteroids
    .filter(asteroid => !vector.same(asteroid, a))
    .filter(asteroid => hasLineOfSight(a, asteroid, asteroids))
    .length;
};

const bestOutpostLocation = (asteroids) => {
  const bestLocation = asteroids.reduce((maybeBest, asteroid) => {
    const count = lineOfSightCount(asteroid, asteroids);
    const positionString = vector.toString(asteroid);
    const nextBest = { count, position: positionString };
    return maybe.just(maybe.match({
      [maybe.Just]: (best) => {
        if (best.count > count) return best;
        return nextBest;
      },
      [maybe.Nothing]: () => nextBest,
    }, maybeBest));
  }, maybe.nothing({ count: 0 }));

  return maybe.match({ [maybe.Just]: b => b }, bestLocation);
};

const RADIANS_TO_DEGREES = 180 / Math.PI;
const toDegrees = radians => {
  let v = (radians * RADIANS_TO_DEGREES) - 270;
  if (v >= 0) return v % 360;
  while (v < 0) {
    v += 360;
  }
  return v;
}

const getAsteroidAngles = (station, asteroids) => {
  return asteroids
    .map((position) => ({
      position,
      angle: toDegrees(Math.atan2(position.y - station.y, position.x - station.x)),
    }))
    .sort((a, b) => a.angle - b.angle);
};

const nextAsteroid = (station, angle, asteroids) => {
  return asteroids
    .filter(asteroid => asteroid.angle > angle)
    .find(asteroid => (
      hasLineOfSight(station, asteroid.position, asteroids.map(({ position }) => position))
    ));
};

const vaporizeCountAsteroids = (station, count, initialAsteroids) => {
  let asteroids = getAsteroidAngles(station, initialAsteroids.filter(asteroid => !vector.same(asteroid, station)));
  const vaporizations = [];

  const canContinue = () => vaporizations.length < count && asteroids.length > 0;

  let angle = -1;
  let failOnEmpty = false;
  while (canContinue()) {
    const result = nextAsteroid(station, angle, asteroids);
    if (!result) {
      if (failOnEmpty) {
        console.warn('failed twice!');
        return [];
      }
      angle = -1;
      failOnEmpty = true;
      continue;
    }
    vaporizations.push(result.position);
    angle = result.angle;
    asteroids = asteroids.filter(asteroid => !vector.same(asteroid, result.position));
    failOnEmpty = false;
  }

  return vaporizations;
}

module.exports = {
  loadFromString,
  loadFromFile,
  bestOutpostLocation,
  vaporizeCountAsteroids,
};
