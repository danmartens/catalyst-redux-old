// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { addResource } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

export default function FindResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: ResourceID) => string,
  normalizeResponse?: Function
}) {
  return AsyncOperation({
    actionType: 'FIND_RESOURCE',
    actionCreator: (resourceId: ResourceID) => {
      return {
        payload: resourceId,
        status: null
      };
    },
    request: (action: { payload: ResourceID }) => {
      return axios
        .get(resourceURL(action.payload))
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
