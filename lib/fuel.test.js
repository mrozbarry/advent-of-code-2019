const path = require('path');
const test = require('ava');

const fuel = require('./fuel');

const massList = path.resolve(__dirname, '..', 'day1.lst');

test('it matches part 1 test data', (t) => {
  t.is(fuel.fromMass(12), 2);
  t.is(fuel.fromMass(14), 2);
  t.is(fuel.fromMass(1969), 654);
  t.is(fuel.fromMass(100756), 33583);
});

test('it can read masses from a file', (t) => {
  t.plan(2);

  return fuel.readMassesFrom(massList)
    .then((data) => {
      t.is(data.length, 100);
      t.pass();
    })
    .catch((err) => {
      t.fail(err.toString());
    });
});

test('it matches part 2 test data', (t) => {
  t.is(fuel.fromMassAndFuel(14), 2);
  t.is(fuel.fromMassAndFuel(1969), 966);
  t.is(fuel.fromMassAndFuel(100756), 50346);
});
