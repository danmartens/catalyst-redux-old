// @flow

import axios from 'axios';

import AsyncOperation from './AsyncOperation';
import { addResource } from './utils';
import type { ResourceID, ResourceModuleState } from './types';

export default function CreateResourceOperation({
  resourcesURL,
  normalizeResponse = response => response.data
}: {
  resourcesURL: () => string,
  normalizeResponse?: Function
}) {
  return AsyncOperation({
    actionType: 'CREATE_RESOURCE',
    actionCreator: (attributes: Object) => {
      return {
        payload: attributes,
        status: null
      };
    },
    request: (action: { payload: Object }) => {
      return axios
        .post(resourcesURL(), action.payload)
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
