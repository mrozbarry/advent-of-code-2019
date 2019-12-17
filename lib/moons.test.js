const test = require('ava');
const moons = require('./moons');
const vector3 = require('./vector3');

test('creates a moon', (t) => {
  const foo = moons.make(vector3.make(0, 0, 0));

  t.deepEqual(foo, {
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
  });
});

test('can apply gravity', (t) => {
  const Ganymede = moons.make(vector3.make(3, 0, 0));
  const Callisto = moons.make(vector3.make(5, 0, 0));

  const [nextGanymede, nextCallisto] = moons.applyGravity([Ganymede, Callisto]);

  t.deepEqual(nextGanymede.velocity.x, 1);
  t.deepEqual(nextCallisto.velocity.x, -1);
});

test('can apply velocity', (t) => {
  const Io = {
    ...moons.make(vector3.make(1, 2, 3)),
    velocity: {
      x: -2,
      y: 0,
      z: 3,
    },
  };

  const [nextIo] = moons.applyVelocity([Io]);

  t.deepEqual(nextIo.position, {
    x: -1,
    y: 2,
    z: 6,
  });
});

const matcher = /pos=(<[^>]+>), vel=(<[^>]+>)/
const parseMoons = str => {
  return str
    .split('\n')
    .map(line => line.trim())
    .filter(line => !line.startsWith('#'))
    .map((moonStr) => {
      const [_, pos, vel] = matcher.exec(moonStr);

      return {
        position: vector3.fromString(pos),
        velocity: vector3.fromString(vel),
      };
    });
}

test('can step simulation', (t) => {
  const expectations = [
    // Step 0
    `pos=<x=-1, y=  0, z= 2>, vel=<x= 0, y= 0, z= 0>
pos=<x= 2, y=-10, z=-7>, vel=<x= 0, y= 0, z= 0>
pos=<x= 4, y= -8, z= 8>, vel=<x= 0, y= 0, z= 0>
pos=<x= 3, y=  5, z=-1>, vel=<x= 0, y= 0, z= 0>`,
    // Step 1
    `pos=<x= 2, y=-1, z= 1>, vel=<x= 3, y=-1, z=-1>
pos=<x= 3, y=-7, z=-4>, vel=<x= 1, y= 3, z= 3>
pos=<x= 1, y=-7, z= 5>, vel=<x=-3, y= 1, z=-3>
pos=<x= 2, y= 2, z= 0>, vel=<x=-1, y=-3, z= 1>`,
    // Step 2
    `pos=<x= 5, y=-3, z=-1>, vel=<x= 3, y=-2, z=-2>
pos=<x= 1, y=-2, z= 2>, vel=<x=-2, y= 5, z= 6>
pos=<x= 1, y=-4, z=-1>, vel=<x= 0, y= 3, z=-6>
pos=<x= 1, y=-4, z= 2>, vel=<x=-1, y=-6, z= 2>`,
    // Step 3
    `pos=<x= 5, y=-6, z=-1>, vel=<x= 0, y=-3, z= 0>
pos=<x= 0, y= 0, z= 6>, vel=<x=-1, y= 2, z= 4>
pos=<x= 2, y= 1, z=-5>, vel=<x= 1, y= 5, z=-4>
pos=<x= 1, y=-8, z= 2>, vel=<x= 0, y=-4, z= 0>`,
    // Step 4
    `pos=<x= 2, y=-8, z= 0>, vel=<x=-3, y=-2, z= 1>
pos=<x= 2, y= 1, z= 7>, vel=<x= 2, y= 1, z= 1>
pos=<x= 2, y= 3, z=-6>, vel=<x= 0, y= 2, z=-1>
pos=<x= 2, y=-9, z= 1>, vel=<x= 1, y=-1, z=-1>`,
    // Step 5
    `pos=<x=-1, y=-9, z= 2>, vel=<x=-3, y=-1, z= 2>
pos=<x= 4, y= 1, z= 5>, vel=<x= 2, y= 0, z=-2>
pos=<x= 2, y= 2, z=-4>, vel=<x= 0, y=-1, z= 2>
pos=<x= 3, y=-7, z=-1>, vel=<x= 1, y= 2, z=-2>`,
    // Step 6
    `pos=<x=-1, y=-7, z= 3>, vel=<x= 0, y= 2, z= 1>
pos=<x= 3, y= 0, z= 0>, vel=<x=-1, y=-1, z=-5>
pos=<x= 3, y=-2, z= 1>, vel=<x= 1, y=-4, z= 5>
pos=<x= 3, y=-4, z=-2>, vel=<x= 0, y= 3, z=-1>`,
    // Step 7
    `pos=<x= 2, y=-2, z= 1>, vel=<x= 3, y= 5, z=-2>
pos=<x= 1, y=-4, z=-4>, vel=<x=-2, y=-4, z=-4>
pos=<x= 3, y=-7, z= 5>, vel=<x= 0, y=-5, z= 4>
pos=<x= 2, y= 0, z= 0>, vel=<x=-1, y= 4, z= 2>`,
    // Step 8
    `pos=<x= 5, y= 2, z=-2>, vel=<x= 3, y= 4, z=-3>
pos=<x= 2, y=-7, z=-5>, vel=<x= 1, y=-3, z=-1>
pos=<x= 0, y=-9, z= 6>, vel=<x=-3, y=-2, z= 1>
pos=<x= 1, y= 1, z= 3>, vel=<x=-1, y= 1, z= 3>`,
    // Step 9
    `pos=<x= 5, y= 3, z=-4>, vel=<x= 0, y= 1, z=-2>
pos=<x= 2, y=-9, z=-3>, vel=<x= 0, y=-2, z= 2>
pos=<x= 0, y=-8, z= 4>, vel=<x= 0, y= 1, z=-2>
pos=<x= 1, y= 1, z= 5>, vel=<x= 0, y= 0, z= 2>`,
    // Step 10
    `pos=<x= 2, y= 1, z=-3>, vel=<x=-3, y=-2, z= 1>
pos=<x= 1, y=-8, z= 0>, vel=<x=-1, y= 1, z= 3>
pos=<x= 3, y=-6, z= 1>, vel=<x= 3, y= 2, z=-3>
pos=<x= 2, y= 0, z= 4>, vel=<x= 1, y=-1, z=-1>`,
  ].map(parseMoons);

  let data = moons.fromString(`<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`);

  t.deepEqual(data, expectations[0], 'initial moon positions are incorrect');

  for(let step = 1; step < expectations.length; step++) {
    data = moons.step(data);
    t.deepEqual(data, expectations[step], `failed on step ${step}`);
  }
});

test('can calculate energy', (t) => {
  const afterOneHundredSteps = parseMoons(`pos=<x=  8, y=-12, z= -9>, vel=<x= -7, y=  3, z=  0>
pos=<x= 13, y= 16, z= -3>, vel=<x=  3, y=-11, z= -5>
pos=<x=-29, y=-11, z= -1>, vel=<x= -3, y=  7, z=  4>
pos=<x= 16, y=-13, z= 23>, vel=<x=  7, y=  1, z=  1>`);

  const energy = moons.calculateEnergy(afterOneHundredSteps);

  t.deepEqual(energy, [
    { potential: 29, kinetic: 10, total: 290 },
    { potential: 32, kinetic: 19, total: 608},
    { potential: 41, kinetic: 14, total: 574},
    { potential: 52, kinetic: 9, total: 468},
  ]);
});

test('can calculate number of iteration steps to return to 0', (t) => {
  const data = moons.fromString(`<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`);
  const { lcm } = moons.calculateTotalPeriod(data);
  t.is(lcm, 4686774924);
});
