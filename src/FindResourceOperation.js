// @flow

import axios from 'axios';
import { put, call } from 'redux-saga/effects';

import AsyncOperation from './AsyncOperation';
import { addResources, setResourceStatus } from './utils';
import type {
  ResourceID,
  ResourceType,
  ResourceModuleState,
  ResourcesConfig
} from './types';

type Options = {
  resources: ResourcesConfig,
  normalizeResponse?: Function
};

export default function FindResourceOperation({
  resources,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(resourceType: ResourceType, resourceId: ResourceID) {
    return {
      payload: { type: resourceType, id: resourceId },
      status: null
    };
  }

  function request(action: {
    payload: { type: ResourceType, id: ResourceID }
  }) {
    const { type, id } = action.payload;
    const url = resources[type].resourceURL(id);

    return axios.get(url).then(response => {
      if (typeof resources[type].normalizeResponse === 'function') {
        return resources[type].normalizeResponse(response);
      } else {
        return normalizeResponse(response);
      }
    });
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    const { status, payload } = action;

    switch (status) {
      case 'pending': {
        return setResourceStatus(
          state,
          payload.type,
          payload.id,
          'find.pending'
        );
      }

      case 'success': {
        state = addResources(state, payload);

        return setResourceStatus(
          state,
          payload.data.type,
          payload.data.id,
          'find.success'
        );
      }

      case 'error': {
        return setResourceStatus(state, payload.type, payload.id, 'find.error');
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
            type: action.payload.type,
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
