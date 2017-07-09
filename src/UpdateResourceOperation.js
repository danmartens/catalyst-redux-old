// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { addResource } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

export default function UpdateResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: ResourceID) => string,
  normalizeResponse?: Function
}) {
  return AsyncOperation({
    actionType: 'UPDATE_RESOURCE',
    actionCreator: (id: ResourceID, attributes: Object) => {
      return {
        payload: { id, attributes },
        status: null
      };
    },
    request: (action: { payload: { id: ResourceID, attributes: Object } }) => {
      return axios
        .patch(resourceURL(action.payload.id), action.payload.attributes)
        .then(response => normalizeResponse(response));
    },
    reducer: (state: ResourceModuleState, action): ResourceModuleState => {
      switch (action.status) {
        case 'success': {
          const { data } = action.payload;

          return addResource(state, data.id, data.attributes);
        }
      }

      return state;
    }
  });
}
