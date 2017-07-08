// @flow

import { all } from 'redux-saga/effects';

type ExtractActionCreator = <V>(
  (...args: Array<*>) => { actionCreator: V }
) => V;

export default function createModule<
  OperationsMap: { [key: string]: * },
  Selectors: { [key: string]: * }
>(
  moduleName: string,
  operationsMap: OperationsMap,
  selectors: Selectors
): (
  initialState: *
) => {
  moduleName: string,
  actions: $ObjMap<OperationsMap, ExtractActionCreator>,
  selectors: Selectors,
  reducer: *,
  saga: *
} {
  const operations = {};
  const actions = {};

  for (const actionName in operationsMap) {
    if (operationsMap.hasOwnProperty(actionName)) {
      const operation = operationsMap[actionName](moduleName);

      operations[actionName] = operation;
      actions[actionName] = operation.actionCreator;
    }
  }

  const operationsReducer = composeOperationReducers(operations);

  const defaultSaga = function*() {
    yield all(
      Object.keys(operations).map(actionName => {
        const saga = operations[actionName].saga || function*() {};
        return saga();
      })
    );
  };

  const mappedSelectors = ((mapSelectors(
    moduleName,
    selectors
  ): any): Selectors);

  return (initialState: *) => {
    const defaultReducer = (state: *, action: *) => {
      if (state === undefined) {
        return initialState;
      } else {
        return operationsReducer(state, action);
      }
    };

    return {
      moduleName,
      reducer: defaultReducer,
      saga: defaultSaga,
      selectors: mappedSelectors,
      actions
    };
  };
}

function mapSelectors(stateKey: string, selectors: *) {
  const mappedSelectors = {};

  Object.keys(selectors).forEach(selectorName => {
    mappedSelectors[selectorName] = (state, ...args) => {
      return selectors[selectorName](state[stateKey], ...args);
    };
  });

  return mappedSelectors;
}

function composeOperationReducers(operations: {
  [key: string]: { reducer: * }
}) {
  return (state, action) =>
    Object.keys(operations).reduce((prevState, actionName) => {
      return operations[actionName].reducer(prevState, action);
    }, state);
}
