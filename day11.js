const path = require('path');
const { read } = require('./lib/file');
const intcode = require('./lib/intcode2');
const paintingrobot = require('./lib/paintingrobot');

const robotCode = path.resolve(__dirname, 'day11.program');

const part1 = async (code) => {
  let grid = {};
  let robot = {};
  const paintingRobot = paintingrobot.make({}, (lastGrid, lastRobot) => {
    grid = lastGrid;
    robot = lastRobot;
  });

  await intcode.run(code, paintingRobot);

  paintingrobot.toConsole(robot, grid);
  const paintPositions = Object.keys(grid.uniquePaints);
  console.log('unique paint positions', paintPositions.length);
}

const part2 = async (code) => {
  let grid = {};
  let robot = {};
  const paintingRobot = paintingrobot.make({ '0,0': 1 }, (lastGrid, lastRobot) => {
    grid = lastGrid;
    robot = lastRobot;
  });

  await intcode.run(code, paintingRobot);

  paintingrobot.toConsole(robot, grid);
  const paintPositions = Object.keys(grid.uniquePaints);
  console.log('unique paint positions', paintPositions.length);
}

read(robotCode)
  .then(async (code) => {
    await part1(code);
    await part2(code);
  });

