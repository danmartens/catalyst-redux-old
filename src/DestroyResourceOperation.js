// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { removeResource } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

export default function DestroyResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: string | number) => string,
  normalizeResponse?: Function
}) {
  return AsyncOperation({
    actionType: 'DESTROY_RESOURCE',
    actionCreator: (resourceId: ResourceID) => {
      return {
        payload: resourceId,
        status: null
      };
    },
    request: (action: { payload: ResourceID }) => {
      return axios.delete(resourceURL(action.payload)).then(() => ({
        data: {
          id: action.payload
        }
      }));
    },
    reducer: (state: ResourceModuleState, action): ResourceModuleState => {
      switch (action.status) {
        case 'success': {
          const { data } = action.payload;

          return removeResource(state, data.id);
        }
      }

      return state;
    }
  });
}
