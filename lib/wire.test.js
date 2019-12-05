const path = require('path');
const test = require('ava');
const wire = require('./wire');

test('directionToDelta calculates the correct deltas', (t) => {
  t.plan(4);

  t.deepEqual(wire.directionToDelta('R100'), { x: 100, y: 0 });
  t.deepEqual(wire.directionToDelta('L857'), { x: -857, y: 0});
  t.deepEqual(wire.directionToDelta('U1'), { x: 0, y: -1 });
  t.deepEqual(wire.directionToDelta('D99'), { x: 0, y: 99 });
});

test('point of intersection gives the correct information', (t) => {
  t.plan(1);

  t.deepEqual(wire.pointOfIntersection(
    wire.line({ x: -1, y: -5 }, { x: -1, y: 10 }),
    wire.line({ x: -2, y: -2 }, { x: 4, y: -2 }),
  ), ['just', { x: -1, y: -2 }])
});

test('map creates a set of lines', (t) => {
  const directions = 'U10,R5';
  const expectedLines = [
    wire.line({ x: 0, y: 0 }, { x: 0, y: -10 }, 10),
    wire.line({ x: 0, y: -10 }, { x: 5, y: -10 }, 5),
  ];

  t.deepEqual(wire.map(directions), expectedLines);
});

test('manhattanDistanceFromOrigin matches the sample data', (t) => {
  t.plan(2);

  t.is(wire.manhattanDistanceFromOrigin(
    wire.map('R75,D30,R83,U83,L12,D49,R71,U7,L72'),
    wire.map('U62,R66,U55,R34,D71,R55,D58,R83'),
  ), 159);

  t.is(wire.manhattanDistanceFromOrigin(
    wire.map('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51'),
    wire.map('U98,R91,D20,R16,D67,R40,U7,R15,U6,R7'),
  ), 135);
});

test('part 1 challenge is correct', (t) => {
  t.plan(1);

  return wire.readFromFile(path.resolve(__dirname, '..', 'day3.wiring'))
    .then(([a, b]) => wire.manhattanDistanceFromOrigin(a, b))
    .then(v => t.is(v, 266));
});

test.only('shortestSignalDelayIntersectionDistance matches sample data', (t) => {
  t.plan(2);

  t.is(wire.shortestSignalDelayIntersectionDistance(
    wire.map('R75,D30,R83,U83,L12,D49,R71,U7,L72'),
    wire.map('U62,R66,U55,R34,D71,R55,D58,R83'),
  ), 610);

  t.is(wire.shortestSignalDelayIntersectionDistance(
    wire.map('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51'),
    wire.map('U98,R91,D20,R16,D67,R40,U7,R15,U6,R7'),
  ), 410);
});
