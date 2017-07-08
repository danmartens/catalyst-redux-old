// @flow

declare var test: Function;
declare var expect: Function;

import createModule from '../createModule';
import createAsyncOperation from '../createAsyncOperation';

const currentUser = createModule('currentUser', {
  fetch: createAsyncOperation({
    actionType: 'FETCH',
    reducer: (state, action) => {
      switch (action.status) {
        case 'pending': {
          return { ...state, fetchStatus: 'pending' };
        }

        case 'success': {
          return { ...state, fetchStatus: 'success', user: action.payload };
        }

        case 'error': {
          return { ...state, fetchStatus: 'error' };
        }
      }

      return state;
    },
    request: () => Promise.resolve({ name: 'Jane Doe' })
  })
})({
  fetchStatus: null,
  user: null
});

test('async operation reducer', () => {
  let state = currentUser.reducer();

  expect(state).toEqual({
    fetchStatus: null,
    user: null
  });

  state = currentUser.reducer(state, currentUser.actions.fetch());

  expect(state).toEqual({
    fetchStatus: null,
    user: null
  });

  state = currentUser.reducer(
    state,
    currentUser.actions.fetch({ name: 'Jane Doe' }, 'success')
  );

  expect(state).toEqual({
    fetchStatus: 'success',
    user: { name: 'Jane Doe' }
  });
});
