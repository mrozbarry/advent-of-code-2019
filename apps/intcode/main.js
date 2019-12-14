import '@babel/polyfill';
import { app, h } from 'hyperapp';
import * as maybe from '../../lib/maybe';
import { loadFromString, step, isProgramDone } from '../../lib/intcode2';

const decodeValue = e => e.target.value;

const Init = () => (
  {
    code: '',
    program: maybe.nothing(),
    inputsBuffer: [],
    outputs: [],
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
  program: maybe.just(loadFromString(state.code)),
});

const ProgramUnload = state => ({ ...state, program: maybe.nothing() });

const ProgramResult = (state, program) => ({
  ...state,
  program: program ? maybe.just(program) : maybe.nothing(),
});

const inputFromPrompt = () => ({
  next: () => ({
    done: false,
    value: window.prompt('Program is expecting input'),
  }),
});

const StepFX = async (dispatch, { program, inputsBuffer }) => {
  const nextProgram = await step(program, {
    input: inputFromPrompt(),
    //input: {
      //next: () => {
        //const value = inputsBuffer.shift();
        //return {
          //value,
          //done: false,
        //}
      //},
    //},
    output: (v) => window.alert(`Program output: ${v}`),
  });
  dispatch(ProgramResult, nextProgram);
};
const Step = (program) => [StepFX, { program }];

const ProgramStep = (state) => maybe.match({
  [maybe.Nothing]: () => state,
  [maybe.Just]: (program) => {
    if (program.memory[program.address] === 99) {
      return state;
    }

    return [state, Step(program)];
  },
}, state.program)

const AddInput = (state, integer) => ({ ...state, inputsBuffer: [integer].concat(state.inputsBuffer) });

const viewInputs = ({ inputsBuffer }) => h('div', null, [

]);

const viewOutputs = ({ outputs }) => h('div', null, ['Outputs', h('ul', null, outputs.map(v => h('li', null, v)))]);

app({
  init: Init,
  view: state => {
    return h('div', null, [
      maybe.match({
        [maybe.Just]: (program) => {
          return h('section', null, [
            h('button', { onclick: ProgramStep, disabled: isProgramDone(program) }, 'Step program'),
            h('button', { onclick: ProgramUnload }, 'Unload program'),
            h(
              'div',
              {
                class: 'program',
              },
              program.memory.map((v, addr) => h(
                'div',
                {
                  class: {
                    block: true,
                    highlight: addr === program.address,
                  },
                },
                v.toString()
              )),
            ),
            viewOutputs(state),
          ]);
        },
        [maybe.Nothing]: () => h('section', null, [
          h('div', null, [
            h('textarea', { value: state.code, oninput: [CodeUpdate, decodeValue] }),
          ]),
          h('button', { onclick: ProgramLoad }, 'Load program'),
          h('strong', null, 'No program loaded'),
        ]),
      }, state.program),
    ]);
  },
  node: document.getElementById('app'),
});
