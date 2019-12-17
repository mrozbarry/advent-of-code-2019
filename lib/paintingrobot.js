const vector = require('./vector');

const TURN_DIRECTIONS = [
  vector.make(0, -1), // up
  vector.make(1, 0), // right
  vector.make(0, 1), // down
  vector.make(-1, 0), // left
];

const TURN_NAMES = [
  'up',
  'right',
  'down',
  'left',
];

const turnToString = (turn) => TURN_NAMES[turn];

const gridMake = (initialColorMap = {}) => ({
  uniquePaints: {},
  colorMap: initialColorMap,
});

const paintAt = (color, robot, grid) => {
  const pos = vector.toString(robot.position);
  return {
    colorMap: {
      ...grid.colorMap,
      [pos]: color,
    },
    uniquePaints: {
      ...grid.uniquePaints,
      [pos]: true,
    },
  };
};

const colorAt = (robot, grid) => {
  const pos = vector.toString(robot.position);
  const color = grid.colorMap[pos];
  if (typeof color === 'undefined') {
    return 0;
  }
  return color;
};

const robotMake = () => ({
  position: vector.make(0, 0),
  direction: 0,
});

const robotTurn = (turn, robot) => {
  const directionChange = turn === 1 ? 1 : -1;
  let direction = (robot.direction + directionChange) % TURN_DIRECTIONS.length;
  if (direction < 0) direction += TURN_DIRECTIONS.length;

  return {
    ...robot,
    direction,
  };
};

const robotMoveForward = (robot) => {
  const delta = TURN_DIRECTIONS[robot.direction];
  return {
    ...robot,
    position: vector.add(robot.position, delta),
  };
};

const turnAndMove = (turn, robot) => {
  return robotMoveForward(robotTurn(turn, robot));
}

const make = (initialColorMap, onChange = (() => {})) => {
  let buffer = (void 0);
  let grid = gridMake(initialColorMap);
  let robot = robotMake();

  const appendBuffer = (value, onTuple) => {
    if (typeof buffer !== 'undefined') {
      const color = buffer
      buffer = (void 0);
      return onTuple([color, value]);
    }
    buffer = value;
  };

  const adapter = {
    input: {
      next: () => {
        return ({
          value: colorAt(robot, grid),
          done: false,
        });
      },
    },
    output: (value) => {
      return appendBuffer(value, ([color, direction]) => {
        grid = paintAt(color, robot, grid);
        robot = turnAndMove(direction, robot)
        onChange(grid, robot);
      });
    },
  };

  return adapter;
};

const toConsole = (robot, grid) => {
  const positions = Object.keys(grid.colorMap).map(vector.fromString);
  if (robot && robot.position) {
    positions.push(robot.position);
  }

  const min = vector.make(
    positions.reduce((min, p) => Math.min(min, p.x), 0) - 2,
    positions.reduce((min, p) => Math.min(min, p.y), 0) - 2,
  );
  const max = vector.make(
    positions.reduce((max, p) => Math.max(max, p.x), 0) + 2,
    positions.reduce((max, p) => Math.max(max, p.y), 0) + 2,
  );

  const colors = ['█', '░'];
  // const colors = ['.', '#'];
  const directions = ['^', '>', 'v', '<'];

  console.log(robot ? robot : 'No robot data');
  for(let y = min.y; y <= max.y; y++) {
    const buffer = [];
    for(let x = min.x; x <= max.x; x++) {
      const position = vector.make(x, y);
      if (robot && robot.position && vector.same(position, robot.position)) {
        buffer.push(directions[robot.direction]);
        continue;
      }
      const color = grid.colorMap[vector.toString(position)] || 0;
      buffer.push(colors[color]);
    }
    console.log('|', buffer.join(''), '|');
  }
};

module.exports = {
  make,
  turnToString,
  toConsole,
};
