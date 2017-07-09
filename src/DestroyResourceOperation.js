// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { removeResource, setResourceStatus } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

type Options = {
  resourceURL: (id: string | number) => string,
  normalizeResponse?: Function
};

export default function DestroyResourceOperation({
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
    return axios.delete(resourceURL(action.payload.id)).then(() => ({
      id: action.payload.id
    }));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    const { status, payload } = action;

    switch (status) {
      case 'pending': {
        return setResourceStatus(state, payload.id, 'destroy.pending');
      }

      case 'success': {
        return setResourceStatus(
          removeResource(state, payload.id),
          payload.id,
          'destroy.success'
        );
      }
    }

    return state;
  }

  return AsyncOperation({
    actionType: 'DESTROY_RESOURCE',
    actionCreator,
    request,
    reducer
  });
}
