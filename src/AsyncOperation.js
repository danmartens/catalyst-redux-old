// @flow

import { takeEvery, put, call } from 'redux-saga/effects';
import { reducerForActionType } from './utils';

type AsyncOperationType<ActionCreator, Reducer, Saga> = (
  actionTypePrefix: string
) => {
  actionCreator: ActionCreator,
  reducer: Reducer,
  saga: Generator<*, *, *>
};

export default function AsyncOperation<
  ActionCreator: *,
  Reducer: *,
  Saga: Generator<*, *, *>
>({
  actionType,
  actionCreator = (payload = null, status = null) => ({ status, payload }),
  reducer,
  request,
  saga = sagaForAsyncFunction(request)
}: {
  actionType: string,
  actionCreator?: ActionCreator,
  request?: (...args: Array<*>) => Promise<*>,
  reducer: Reducer,
  saga?: *
}): AsyncOperationType<ActionCreator, Reducer, Saga> {
  return (actionTypePrefix: string) => {
    const type = `${actionTypePrefix}/${actionType}`;

    const newActionCreator = (...args: Array<*>) => ({
      type,
      ...actionCreator(...args)
    });

    return {
      actionCreator: ((newActionCreator: any): ActionCreator),
      reducer: ((reducerForActionType(reducer, type): any): Reducer),
      saga: ((sagaForActionType(saga, type): any): Saga)
    };
  };
}

function sagaForActionType(saga: *, actionType: string) {
  return function*() {
    yield takeEvery(actionType, saga);
  };
}

function sagaForAsyncFunction(asyncFunction) {
  return function*(action) {
    if (action.status === null) {
      yield put({
        type: action.type,
        status: 'pending',
        payload: action.payload
      });

      try {
        const result = yield call(asyncFunction, action);

        yield put({
          type: action.type,
          status: 'success',
          payload: result
        });
      } catch (error) {
        yield put({
          type: action.type,
          status: 'error',
          payload: error
        });
      }
    }
  };
}
