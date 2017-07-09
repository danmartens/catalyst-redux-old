// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { addResource, setResourceStatus } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

type Options = {
  resourceURL: (id: ResourceID) => string,
  normalizeResponse?: Function
};

export default function UpdateResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(id: ResourceID, attributes: Object) {
    return {
      payload: { id, attributes },
      status: null
    };
  }

  function request(action: {
    payload: { id: ResourceID, attributes: Object }
  }) {
    return axios
      .patch(resourceURL(action.payload.id), action.payload.attributes)
      .then(response => normalizeResponse(response));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    const { status, payload } = action;

    switch (status) {
      case 'pending': {
        return setResourceStatus(state, payload.id, 'update.pending');
      }

      case 'success': {
        const { data } = payload;

        return setResourceStatus(
          addResource(state, data.id, data.attributes),
          data.id,
          'update.success'
        );
      }
    }

    return state;
  }

  return AsyncOperation({
    actionType: 'UPDATE_RESOURCE',
    actionCreator,
    request,
    reducer
  });
}
