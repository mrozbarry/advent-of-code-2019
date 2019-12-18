const path = require('path');
const intcode = require('./lib/intcode2');
const arcadeGame = require('./lib/arcadeGame');
const vector = require('./lib/vector');
const { terminal } = require('terminal-kit');

const programPath = path.resolve(__dirname, 'day13.program');

const TILES = {
  EMPTY: 0,
  WALL: 1,
  BLOCK: 2,
  PADDLE: 3,
  BALL: 4,

};

const TILE_MAP = {
  [TILES.EMPTY]: ' ',
  [TILES.WALL]: '█',
  [TILES.BLOCK]: '▓',
  [TILES.PADDLE]: '═',
  [TILES.BALL]: '¤',
};

const drawTilesOnce = (_, tiles) => {
  const positions = Object.keys(tiles).map(vector.fromString);

  const bottomRight = positions.reduce((max, point) => {
    return vector.make(
      Math.max(max.x, point.x),
      Math.max(max.y, point.y),
    );
  }, vector.make(0, 0));

  for(let y = 0; y <= bottomRight.y; y++) {
    let line = '';
    for(let x = 0; x <= bottomRight.x; x++) {
      const p = vector.toString(vector.make(x, y));
      line += TILE_MAP[tiles[p]] || ' ';
    }
    console.log(line);
  }
};

const part1 = async (code) => {
  let tiles = {};

  await intcode.run(code, arcadeGame.make((_, nextTiles) => {
    tiles = nextTiles;
  }));


  drawTilesOnce(tiles);
  console.log('block tiles', Object.values(tiles).filter(v => v === TILES.BLOCK).length);
};

const part2 = async (code) => {
  terminal.clear();
  let ball = vector.make(0, 0);
  let paddle = vector.make(0, 0);
  let score = 0;
  const drawTilesWithTerminalKit = (tile) => {
    const key = Object.keys(tile)[0];
    const position = vector.fromString(key);
    const tileId = tile[key];
    switch (tileId) {
      case TILES.PADDLE:
        paddle = position;
        break;
      case TILES.BALL:
        ball = position;
        break;
    }
    terminal.moveTo(position.x + 1, position.y + 1, TILE_MAP[tileId]);
  };
  await intcode.run(
    arcadeGame.withQuarters(2, code),
    arcadeGame.make(
      drawTilesWithTerminalKit,
      (s) => {
        score = s;
        terminal.moveTo(1, 1, ` Score: ${score} `);
      },
      () => {
        return Math.sign(ball.x - paddle.x);
      },
      1,
    ),
  );
  return score;
};

intcode.loadFromFile(programPath)
  .then(async (code) => {
    // await part1(code);

    console.log('final score:', await part2(code));

  });

