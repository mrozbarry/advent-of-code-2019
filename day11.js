const path = require('path');
const { read } = require('./lib/file');
const vector = require('./lib/vector');
const intcode = require('./lib/intcode2');
const paintingrobot = require('./lib/paintingrobot');

const robotCode = path.resolve(__dirname, 'day11.program');

const uniquePaintPositions = paints => Array.from(new Set(
  paints.map(({ position }) => vector.toString(position))
));

read(robotCode)
  .then(async (code) => {
    let paints = {};
    const count = { move: 0, paint: 0 };
    // let move = 0;
    const paintingRobot = paintingrobot.make({
      paint: (_position, _color, allPaints) => {
        count.paint++;
        //console.log('paint', { position, color });
        paints = allPaints;
      },
      move: (turn, curr, prev) => {
        count.move++;
        //console.log(
          //`${move}.`,
          //'turn', (turn === 1 ? 'right' : 'left'),
          //'from', paintingrobot.turnToString(prev.direction),
          //'to', paintingrobot.turnToString(curr.direction),
          //'and move from', vector.toString(prev.position),
          //'to', vector.toString(curr.position),
        //);
      },
    });

    //let program = intcode.loadFromString(code);
    //for(let i = 0; i < 200; i++) {
      //program = await intcode.step(program, paintingRobot);
    //}

    return intcode.run(code, paintingRobot)
      .then(() => {
        console.log('summary', count);
        console.log('unique paint positions', paints);
        paintingrobot.toConsole(paints);
      });
  });

