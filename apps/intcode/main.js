import { app, h } from 'hyperapp';
import * as maybe from '../../lib/maybe';
import { step } from '../../lib/intcode';

const decodeValue = e => e.target.value;

const Init = () => (
  {
    code: '',
    program: maybe.nothing(),
  }
);

const CodeUpdate = (state, code) => ({
  ...state,
  code: maybe.match({
    [maybe.Just]: () => state.code,
    [maybe.Nothing]: () => code,
  }, state.program),
});

const ProgramLoad = (state) => ({
  ...state,
  program: maybe.just({
    memory: [
      state.code.trim().split(',').map(Number),
    ],
    address: 0,
  }),
});

const stepMemoryAndAddress = (memory, address) => {
  return step(memory, address, {
    input: () => Promise.resolve(window.prompt('Program is expecting input')),
    output: (v) => window.alert(`Program output: ${v}`),
  });
};

const ProgramResult = (state, { memory, address }) => ({
  ...state,
  program: maybe.match({
    [maybe.Nothing]: () => maybe.just({ memory: [memory], address }),
    [maybe.Just]: (program) => {
      return maybe.just({
        memory: [...program.memory, memory],
        address,
      });
    },
  }, state.program),
});

const StepFX = (dispatch, { memory, address }) => {
  stepMemoryAndAddress(memory, address)
    .then(result => dispatch(
      ProgramResult,
      {
        memory: result[0],
        address: result[1],
      },
    ))
};
const Step = ({ memory, address }) => [StepFX, { memory, address }];

const ProgramStep = (state) => maybe.match({
  [maybe.Nothing]: () => state,
  [maybe.Just]: (program) => {
    const prevMemory = program.memory[program.memory.length - 1];
    if (prevMemory[program.address] === 99) {
      return state;
    }

    return [state, Step({ memory: prevMemory, address: program.address })];
  },
}, state.program)

const viewCode = ({ program }) => {
  return maybe.match({
    [maybe.Just]: (currentProgram) => {
      const memory = currentProgram.memory[currentProgram.memory.length - 1];
      return h(
        'div',
        {
          class: 'program',
        },
        memory.map((v, addr) => h(
          'div',
          {
            class: {
              block: true,
              highlight: addr === currentProgram.address,
            },
          },
          v.toString()
        )),
      );
    },
    [maybe.Nothing]: () => h('div', { class: 'block' }, [
      h('strong', null, 'No program loaded'),
    ]),
  }, program)
};

app({
  init: Init,
  view: state => {
    return h('div', null, [
      h('div', null, [
        h('textarea', { value: state.code, oninput: [CodeUpdate, decodeValue] }),
      ]),
      h('button', { onclick: ProgramLoad }, 'Load program'),
      h('button', { onclick: ProgramStep }, 'Step program'),
      viewCode(state),
    ]);
  },
  node: document.getElementById('app'),
});
