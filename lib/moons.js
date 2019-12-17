const vector3 = require('./vector3');
const { read } = require('./file');
const maybe = require('./maybe');

const make = (position) => ({ position, velocity: vector3.make(0, 0, 0) });

const gravityPairAxis = (axis, a, b) => ({
  [axis]: a.velocity[axis] + Math.sign(b.position[axis] - a.position[axis])
});

const applyGravityOfPair = (a, b) => {
  return {
    ...a,
    velocity: {
      ...gravityPairAxis('x', a, b),
      ...gravityPairAxis('y', a, b),
      ...gravityPairAxis('z', a, b),
    },
  };
}

const applyGravity = (moons) => {
  const nextMoons = [...moons];
  for(let indexA = 0; indexA < moons.length; indexA++) {
    for(let indexB = 0; indexB < moons.length; indexB++) {
      if (indexA === indexB) continue;
      const a = nextMoons[indexA];
      const b = nextMoons[indexB];
      nextMoons[indexA] = applyGravityOfPair(a, b);
    }
  }
  return nextMoons;
};

const applyVelocity = (moons) => {
  return moons.map(moon => ({
    ...moon,
    position: vector3.add(moon.position, moon.velocity),
  }));
};

const step = (moons) => {
  return applyVelocity(applyGravity(moons));
};

const sumVector3AbsoluteAxis = ({ x, y, z }) => [x, y, z]
  .map(v => Math.abs(v))
  .reduce((sum, amount) => sum + amount, 0);

const calculateEnergy = (moons) => {
  return moons.map((moon) => {
    const potential = sumVector3AbsoluteAxis(moon.position);
    const kinetic = sumVector3AbsoluteAxis(moon.velocity);
    const total = potential * kinetic;

    return { potential, kinetic, total };
  });
};

const fromString = string => string
  .split('\n')
  .map(line => line.trim())
  .filter(line => !!line)
  .map(vector3.fromString)
  .map(make);

const fromFile = file => read(file).then(fromString);

const clone = json => JSON.parse(JSON.stringify(json));

const calculatePeriods = (moons) => {
  let periods = {
    x: NaN,
    y: NaN,
    z: NaN,
  };

  const shouldContinue = () => Object.values(periods).some(Number.isNaN);

  let data = clone(moons);
  let iter = 1;

  const originalAlignment = (axis, collection) => collection
    .every((m, index) => m.position[axis] === moons[index].position[axis])

  while(shouldContinue()) {
    data = step(data);
    iter++;

    if (Number.isNaN(periods.x) && originalAlignment('x', data)) {
      periods.x = iter;
    }
    if (Number.isNaN(periods.y) && originalAlignment('y', data)) {
      periods.y = iter;
    }
    if (Number.isNaN(periods.z) && originalAlignment('z', data)) {
      periods.z = iter;
    }
  }

  return periods;
};

const greatestCommonDivisor = (a, b) => !b ? a : greatestCommonDivisor(b, a % b);
const leastCommonMultiplier = (a, b) => b === 0 ? 0 : (a * b) / greatestCommonDivisor(a, b);

const leastCommonMultiplierOf = (...numbers) => numbers
  .reduce((lcm, number) => leastCommonMultiplier(lcm, number), 1);

const calculateTotalPeriod = (moons) => {
  const periods = calculatePeriods(moons);
  const lcm = leastCommonMultiplierOf(periods.x, periods.y, periods.z);
  return { periods, lcm };
};

module.exports = {
  make,
  applyGravity,
  applyVelocity,
  step,
  calculateEnergy,
  fromString,
  fromFile,
  calculatePeriods,
  calculateTotalPeriod,
};
