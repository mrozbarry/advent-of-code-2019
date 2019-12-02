const { read } = require('./file');

const readMassesFrom = file => read(file)
  .then(data => data.split('\n').filter(v => v !== '').map(v => Number(v)));

const fromMass = mass => Math.floor(mass / 3) - 2;

const fromMassAndFuel = (mass, initial = 0) => {
  const calc = fromMass(mass);
  return calc > 0
    ? fromMassAndFuel(calc, calc + initial)
    : initial;
}

module.exports = {
  fromMass,
  fromMassAndFuel,
  readMassesFrom,
};
