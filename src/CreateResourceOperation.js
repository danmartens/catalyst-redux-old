// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { addResource, setResourceStatus } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

type Options = {
  resourcesURL: () => string,
  normalizeResponse?: Function
};

export default function CreateResourceOperation({
  resourcesURL,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(attributes: Object) {
    return {
      payload: attributes,
      status: null
    };
  }

  function request(action: { payload: Object }) {
    return axios
      .post(resourcesURL(), action.payload)
      .then(response => normalizeResponse(response));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    switch (action.status) {
      case 'success': {
        const { data } = action.payload;

        return setResourceStatus(
          addResource(state, data.id, data.attributes),
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
