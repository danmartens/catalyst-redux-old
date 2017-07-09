// @flow

import axios from 'axios';
import { put, call } from 'redux-saga/effects';

import AsyncOperation from './AsyncOperation';
import { addResource, setResourceStatus } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

type Options = {
  resourceURL: (id: ResourceID) => string,
  normalizeResponse?: Function
};

export default function FindResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(resourceId: ResourceID) {
    return {
      payload: { id: resourceId },
      status: null
    };
  }

  function request(action: { payload: { id: ResourceID } }) {
    return axios
      .get(resourceURL(action.payload.id))
      .then(response => normalizeResponse(response));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    const { status, payload } = action;

    switch (status) {
      case 'pending': {
        return setResourceStatus(state, payload.id, 'find.pending');
      }

      case 'success': {
        const { data } = payload;

        return setResourceStatus(
          addResource(state, data.id, data.attributes),
          data.id,
          'find.success'
        );
      }

      case 'error': {
        return setResourceStatus(state, payload.id, 'find.error');
      }
    }

    return state;
  }

  function* saga(action) {
    if (action.status === null) {
      yield put({
        type: action.type,
        status: 'pending',
        payload: action.payload
      });

      try {
        const result = yield call(request, action);

        yield put({
          type: action.type,
          status: 'success',
          payload: result
        });
      } catch (error) {
        yield put({
          type: action.type,
          status: 'error',
          payload: {
            id: action.payload.id,
            error
          }
        });
      }
    }
  }

  return AsyncOperation({
    actionType: 'FIND_RESOURCE',
    actionCreator,
    request,
    reducer,
    saga
  });
}
