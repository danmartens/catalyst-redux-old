// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { replaceResources } from './utils';
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

export default function FindAllResourcesOperation({
  resources,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(resourceType: ResourceType) {
    return {
      payload: {
        type: resourceType
      },
      status: null
    };
  }

  function request(action: { payload: { type: string } }) {
    const { type } = action.payload;
    const url = resources[type].resourcesURL();

    return axios.get(url).then(response => {
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
        return replaceResources(state, action.payload);
      }
    }

    return state;
  }

  return AsyncOperation({
    actionType: 'FIND_ALL_RESOURCES',
    actionCreator,
    request,
    reducer
  });
}
