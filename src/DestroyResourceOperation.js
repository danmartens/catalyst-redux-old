// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { removeResource, setResourceStatus } from './utils';
import type {
  ResourceType,
  ResourceID,
  ResourceModuleState,
  ResourcesConfig
} from './types';

type Options = {
  resources: ResourcesConfig,
  normalizeResponse?: Function
};

export default function DestroyResourceOperation({
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

    return axios.delete(url).then(() => ({
      type,
      id
    }));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    const { status, payload } = action;

    switch (status) {
      case 'pending': {
        return setResourceStatus(
          state,
          payload.type,
          payload.id,
          'destroy.pending'
        );
      }

      case 'success': {
        return setResourceStatus(
          removeResource(state, payload.type, payload.id),
          payload.type,
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
