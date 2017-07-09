// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { replaceResources } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

type Options = {
  resourcesURL: () => string,
  normalizeResponse?: Function
};

export default function FindAllResourcesOperation({
  resourcesURL,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator() {
    return {
      payload: null,
      status: null
    };
  }

  function request(action: { payload: Object }) {
    return axios
      .get(resourcesURL())
      .then(response => normalizeResponse(response));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    switch (action.status) {
      case 'success': {
        return replaceResources(state, action.payload.data);
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
