// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { addResource, setResourceStatus } from './utils';
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

export default function CreateResourceOperation({
  resources,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(resourceType: ResourceType, attributes: Object) {
    return {
      payload: { type: resourceType, attributes },
      status: null
    };
  }

  function request(action: {
    payload: { type: ResourceType, attributes: Object }
  }) {
    const { type } = action.payload;
    const url = resources[type].resourcesURL();

    return axios
      .post(resources[action.payload.type].resourcesURL(), action.payload)
      .then(response => {
        if (typeof resources[type].normalizeResponse === 'function') {
          return resources[type].normalizeResponse(response);
        } else {
          return normalizeResponse(response);
        }
      });
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    switch (action.status) {
      case 'success': {
        const { data } = action.payload;

        return setResourceStatus(
          addResource(state, data),
          data.type,
          data.id,
          'create.success'
        );
      }
    }

    return state;
  }

  return AsyncOperation({
    actionType: 'CREATE_RESOURCE',
    actionCreator,
    request,
    reducer
  });
}
