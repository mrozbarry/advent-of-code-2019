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

const make = (events) => {
  const buffer = [];
  const paints = {};
  const robot = {
    position: vector.make(0, 0),
    direction: 0,
  };

  const colorAt = (position) => {
    const pos = vector.toString(position);
    return paints[pos] || 0;
  };

  const appendBuffer = (value, onTuple) => {
    buffer.push(value);
    if (buffer.length === 2) {
      onTuple(buffer);
      buffer.splice(0, 2);
    }
  };

  const paintAt = (position, color) => {
    const pos = vector.toString(position);
    paints[pos] = color;
    if (events.paint) {
      events.paint(position, color, { ...paints });
    }
  };

  const robotTurn = (turn) => {
    const directionChange = turn === 1 ? 1 : -1;
    robot.direction = (robot.direction + directionChange) % TURN_DIRECTIONS.length;
    if (robot.direction < 0) robot.direction += TURN_DIRECTIONS.length;
  };

  const robotMoveForward = () => {
    const delta = TURN_DIRECTIONS[robot.direction];
    robot.position = vector.add(robot.position, delta);
  };

  const turnAndMove = (turn) => {
    const prevRobot = { ...robot };

    robotTurn(turn);
    robotMoveForward();

    if (events.move) {
      events.move(turn, { ...robot }, prevRobot);
    }
  }

  const adapter = {
    input: {
      next: () => {
        const c = colorAt(robot.position);
        return c;
      },
      done: false,
    },
    output: (value) => {
      appendBuffer(value, ([color, turn]) => {
        paintAt(robot.position, color);
        turnAndMove(turn);
      });
    },
  };

  return adapter;
};

const toConsole = (paints) => {
  const positions = Object.keys(paints).map(vector.fromString);

  const min = vector.make(
    positions.reduce((min, p) => Math.min(min, p.x), 0),
    positions.reduce((min, p) => Math.min(min, p.y), 0),
  );
  const max = vector.make(
    positions.reduce((max, p) => Math.max(max, p.x), 0),
    positions.reduce((max, p) => Math.max(max, p.y), 0),
  );

  const colors = ['█', '░'];

  for(let y = min.y; y < max.y; y++) {
    const buffer = [];
    for(let x = min.x; x < max.x; x++) {
      const position = vector.make(x, y);
      const color = paints[vector.toString(position)] || 0;
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
