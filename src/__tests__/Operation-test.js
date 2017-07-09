// @flow

declare var test: Function;
declare var expect: Function;

import Module from '../Module';
import Operation from '../Operation';

const counter = Module(
  'counter',
  {
    increment: Operation({
      actionType: 'INCREMENT',
      reducer: state => state + 1
    }),
    decrement: Operation({
      actionType: 'DECREMENT',
      reducer: state => state - 1
    })
  },
  {}
)(0);

test('the initial state is zero', () => {
  expect(counter.reducer()).toEqual(0);
});

test('the state can be incremented', () => {
  let state = counter.reducer();
  const action = counter.actions.increment();

  state = counter.reducer(state, action);
  expect(state).toEqual(1);

  state = counter.reducer(state, action);
  expect(state).toEqual(2);
});

test('the state can be decremented', () => {
  let state = counter.reducer();
  const action = counter.actions.decrement();

  state = counter.reducer(state, action);
  expect(state).toEqual(-1);

  state = counter.reducer(state, action);
  expect(state).toEqual(-2);
});
