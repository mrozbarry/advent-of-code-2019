const path = require('path');

const fuel = require('./lib/fuel');

const sum = arr => arr.reduce((memo, v) => memo + v, 0);

fuel.readMassesFrom(path.resolve(__dirname, 'day1.lst'))
  .then(masses => {
    console.log('without fuel', sum(masses.map(m => fuel.fromMass(m))));
    console.log('including fuel', sum(masses.map(m => fuel.fromMassAndFuel(m))));
  }); // 3406432 (without fuel), 5106777 (with fuel)
