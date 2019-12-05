import * as maybe from './lib/maybe';
import * as wire from './lib/wire';
import dataUrl from './day3.sample1.wiring';

let data = maybe.nothing();

const drawPolyLine = (ctx, lines) => {
  if (lines.length === 0) {
    return;
  }
  ctx.beginPath();
  ctx.moveTo(lines[0].start.x, lines[0].start.y);
  for(const line of lines) {
    ctx.lineTo(line.end.x, line.end.y);
  }
  ctx.stroke();
};

const drawStrokeCircle = (ctx, x, y, radius) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawStrokeX = (ctx, x, y, radius) => {
  ctx.beginPath();
  ctx.moveTo(x - radius, y - radius);
  ctx.lineTo(x + radius, y + radius);

  ctx.moveTo(x + radius, y - radius);
  ctx.lineTo(x - radius, y + radius);
  ctx.stroke();
};

const drawIntersections = (ctx, intersections) => {
  const textSize = 12
  ctx.font = `${textSize}px sans-serif`;
  ctx.textBaseline = 'top';

  for(let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i];
    drawStrokeX(ctx, intersection.point.x, intersection.point.y, 5);

    const text = `#${i}. ${intersection.lineA.length} | ${intersection.lineB.length} => ${intersection.totalLength}`;
    const measure = ctx.measureText(text);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(intersection.point.x - 2, intersection.point.y + 18, measure.width + 4, 20);

    ctx.fillStyle = 'black';

    ctx.fillText(text, intersection.point.x, intersection.point.y + 20);
  }
}

window.getIntersection = (id) => {
  console.log(maybe.match({
    [maybe.Just]: data => data.intersections[id],
    [maybe.Nothing]: () => 'Not found/loaded',
  }, data));
};

window.scratchUpdate = (ctx) => {
  ctx.lineWidth = 2;

  const { wires: [wireA, wireB], intersections } = maybe.match({
    [maybe.Just]: v => v,
    [maybe.Nothing]: () => ({ wires: [[], []], intersections: [] }),
  }, data);

  ctx.strokeStyle = 'blue';
  drawPolyLine(ctx, wireA);

  ctx.strokeStyle = 'black';
  drawPolyLine(ctx, wireB);

  ctx.strokeStyle = 'green';
  drawStrokeX(ctx, 0, 0, 20);

  ctx.strokeStyle = 'red';
  drawIntersections(ctx, intersections);
};

const tryUpdate = () => {
  if (window.scratchTouch) {
    window.scratchTouch();
  } else {
    console.log('window.scratchTouch not found');
    setTimeout(() => {
      tryUpdate();
    }, 100);
  }
}

fetch(dataUrl)
  .then(r => r.text())
  .then(wire.readFromString)
  .then(([wireA, wireB]) => {
    data = maybe.just({
      wires: [wireA, wireB],
      intersections: wire.gatherIntersections(wireA, wireB),
    });
    tryUpdate();
  });
