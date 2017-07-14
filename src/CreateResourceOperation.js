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
    return axios
      .post(resources[action.payload.type].resourcesURL(), action.payload)
      .then(response => normalizeResponse(response));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    switch (action.status) {
      case 'success': {
        const { data } = action.payload;

        return setResourceStatus(
          addResource(state, data.type, data.id, data.attributes),
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
