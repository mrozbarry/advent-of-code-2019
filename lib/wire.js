const maybe = require('./maybe');
const { read } = require('./file');

const vec = (x, y) => ({ x, y });
const vecAdd = (a, b) => vec(a.x + b.x, a.y + b.y);

const directionToDelta = (direction) => {
  const num = Number(direction.slice(1));
  switch (direction[0]) {
    case 'R': return vec(num, 0);
    case 'L': return vec(-num, 0);
    case 'U': return vec(0, -num);
    case 'D': return vec(0, num);
    default: throw new Error('invalid direction');
  }
};

const between = (v1, v2, a) => {
  const min = Math.min(v1, v2);
  const max = Math.max(v1, v2);

  return a >= min && a <= max;
};

const pointOfIntersection = (a, b) => {
  if (a.direction === b.direction) {
    return maybe.nothing();
  }
  if (a.direction !== 'vertical') {
    return pointOfIntersection(b, a);
  }

  const inRangeX = between(b.start.x, b.end.x, a.start.x);
  const inRangeY = between(a.start.y, a.end.y, b.start.y);

  return inRangeX && inRangeY
    ? maybe.just(vec(a.start.x, b.start.y))
    : maybe.nothing();
};

const distance = (a, b) => Math.sqrt(((b.x - a.x) * (b.x - a.x)) + ((b.y - a.y) * (b.y - a.y)));
const line = (start, end, length) => ({
  start,
  end,
  length: length ? length : distance(start, end), 
  direction: start.y === end.y ? 'horizontal' : 'vertical',
})

const map = (directions) => {
  const wiring = [];
  const deltas = directions.split(',').map(directionToDelta);

  let start = vec(0, 0);

  for(const delta of deltas) {
    const end = vecAdd(start, delta);
    const length = Math.abs(delta.x) + Math.abs(delta.y); // can be either/or, not both

    wiring.push(line(start, end, length));

    start = end; }

  return wiring;
};

const wiringLength = (wires) => wires.reduce((sum, wire) => sum + wire.length, 0);

const gatherIntersections = (wireA, wireB) => {
  let intersections = [];

  for(let indexA = 0; indexA < wireA.length; indexA++) {
    const lineA = wireA[indexA];

    for(let indexB = 0; indexB < wireB.length; indexB++) {
      const lineB = wireB[indexB];

      const result = pointOfIntersection(lineA, lineB);

      intersections = maybe.match({
        [maybe.Just]: (v) => {
          if (v.x === 0 && v.y === 0) return intersections;

          const trailingDistA = distance(lineA.start, v);
          if (trailingDistA > lineA.length) {
            throw new Error('trailing distance is longer than wire');
          }
          const trailingDistB = distance(lineB.start, v);
          if (trailingDistB > lineB.length) {
            throw new Error('trailing distance is longer than wire');
          }

          const subWireA = wireA.slice(0, indexA);
          const subWireB = wireB.slice(0, indexB);

          const lengthA = wiringLength(subWireA);
          const lengthB = wiringLength(subWireB);

          const totalLength = (
            lengthA
            + lengthB
            + trailingDistA
            + trailingDistB
          );

          return intersections.concat({
            wireA: subWireA,
            wireB: subWireB,
            lineA,
            lineB,
            wireSegA: subWireA.length,
            wireSegB: subWireB.length,
            trailingDistA,
            trailingDistB,
            lengthA,
            lengthB,
            point: v,
            totalLength,
          });
        },

        [maybe.Nothing]: () => intersections,
      }, result);
    }
  }

  return intersections;
};

const manhattanDistance = v => Math.abs(v.x) + Math.abs(v.y);

const manhattanDistanceFromOrigin = (wireA, wireB) => {
  const maybeMinDist = gatherIntersections(wireA, wireB).reduce((min, intersection) => {
    const distance = manhattanDistance(intersection.point);
    return maybe.just(maybe.match({
      [maybe.Just]: (minDist) => Math.min(distance, minDist),
      [maybe.Nothing]: () => distance,
    }, min));
  }, maybe.nothing());

  return maybe.match({ [maybe.Just]: dist => dist }, maybeMinDist)
};

const shortestSignalDelayIntersectionDistance = (wireA, wireB) => {
  const intersections = gatherIntersections(wireA, wireB);

  const maybeShortest = intersections.reduce((min, intersection) => {
    return maybe.just(maybe.match({
      [maybe.Just]: (minSteps) => Math.min(minSteps, intersection.totalLength),
      [maybe.Nothing]: () => intersection.totalLength,
    }, min));
  }, maybe.nothing());

  return maybe.match({ [maybe.Just]: (dist) => dist }, maybeShortest);
};

const readFromString = string => string
  .split('\n')
  .filter(v => v !== '')
  .map(map);

const readFromFile = file => read(file).then(readFromString);

module.exports = {
  directionToDelta,
  pointOfIntersection,
  line,
  map,
  gatherIntersections,
  manhattanDistanceFromOrigin,
  shortestSignalDelayIntersectionDistance,
  readFromString,
  readFromFile,
};
