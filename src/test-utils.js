// @flow

import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

export function storeForModule(
  module: { reducer: Function, saga: Function, moduleName: string },
  initialSate: Object = {}
) {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    combineReducers({
      [module.moduleName]: module.reducer
    }),
    initialSate,
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(module.saga);

  return store;
}

export function nextStoreState(store) {
  return new Promise((resolve, reject) => {
    const unsubscribe = store.subscribe(() => {
      unsubscribe();
      resolve(store.getState());
    });
  });
}
