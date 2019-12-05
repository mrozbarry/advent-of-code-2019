const path = require('path');
const wire = require('./lib/wire');

const annotate = desc => v => {
  console.log(desc, v);
  return v;
};

wire.readFromFile(path.resolve(__dirname, 'day3.wiring'))
  .then(([a, b]) => wire.manhattanDistanceFromOrigin(a, b))
  .then(annotate('Smallest Manhattan Distance'));

wire.readFromFile(path.resolve(__dirname, 'day3.wiring'))
  .then(([a, b]) => wire.shortestSignalDelayIntersectionDistance(a, b))
  .then(annotate('Smallest Wire Length'));
