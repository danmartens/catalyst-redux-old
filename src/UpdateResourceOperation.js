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

export default function UpdateResourceOperation({
  resources,
  normalizeResponse = response => response.data
}: Options) {
  function actionCreator(
    type: ResourceType,
    id: ResourceID,
    attributes: Object
  ) {
    return {
      payload: { type, id, attributes },
      status: null
    };
  }

  function request(action: {
    payload: { type: ResourceType, id: ResourceID, attributes: Object }
  }) {
    const { type, id } = action.payload;
    const url = resources[type].resourceURL(id);

    return axios
      .patch(url, action.payload.attributes)
      .then(response => normalizeResponse(response));
  }

  function reducer(state: ResourceModuleState, action): ResourceModuleState {
    const { status, payload } = action;

    switch (status) {
      case 'pending': {
        return setResourceStatus(
          state,
          payload.type,
          payload.id,
          'update.pending'
        );
      }

      case 'success': {
        const { data } = payload;

        return setResourceStatus(
          addResource(state, data),
          data.type,
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
