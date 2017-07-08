// @flow

type ExtractActionCreator = <V>(
  (...args: Array<*>) => { actionCreator: V }
) => V;

export default function createModule<OperationsMap: { [key: string]: * }>(
  actionTypePrefix: string,
  operationsMap: OperationsMap
): (
  initialState: *
) => {
  actions: $ObjMap<OperationsMap, ExtractActionCreator>,
  reducer: Function
} {
  const operations = {};
  const actions = {};

  for (const actionName in operationsMap) {
    if (operationsMap.hasOwnProperty(actionName)) {
      const operation = operationsMap[actionName](actionTypePrefix);

      operations[actionName] = operation;
      actions[actionName] = operation.actionCreator;
    }
  }

  const operationsReducer = composeOperationReducers(operations);

  return (initialState: *) => {
    const defaultReducer = (state: *, action: *) => {
      if (state === undefined) {
        return initialState;
      } else {
        return operationsReducer(state, action);
      }
    };

    return {
      reducer: defaultReducer,
      actions
    };
  };
}

function composeOperationReducers(operations: {
  [key: string]: { reducer: * }
}) {
  return (state, action) =>
    Object.keys(operations).reduce((prevState, actionName) => {
      return operations[actionName].reducer(prevState, action);
    }, state);
}
