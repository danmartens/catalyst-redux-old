// @flow

declare var test: Function;
declare var expect: Function;

import createOperation from '../createOperation';
import createModule from '../createModule';

const increment = createOperation({
  actionType: 'INCREMENT',
  reducer: state => state + 1
});

const decrement = createOperation({
  actionType: 'DECREMENT',
  reducer: state => state - 1
});

const counter = createModule('COUNTER', {
  increment,
  decrement
})(0);

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
