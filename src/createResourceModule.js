// @flow

import axios from 'axios';

import createModule from './createModule';
import createAsyncOperation from './createAsyncOperation';

export type ResourceModuleState = {
  resourcesById: { [string]: Object }
};

export default function createResourceModule(
  actionTypePrefix: string,
  options: { buildURL: (id: string | number) => string }
) {
  const operationsMap = {
    findResource: createFindResourceOperation({
      buildURL: options.buildURL
    }),
    destroyResource: createDestroyResourceOperation({
      buildURL: options.buildURL
    })
  };

  const selectors = {
    getResource(state: ResourceModuleState, resourceId: number | string) {
      return state.resourcesById[resourceId.toString()];
    }
  };

  return createModule(actionTypePrefix, operationsMap, selectors)({
    resourcesById: {}
  });
}

function createFindResourceOperation({
  buildURL,
  normalizeResponse = response => response.data
}: {
  buildURL: (id: string | number) => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
    actionType: 'FIND_RESOURCE',
    actionCreator: (resourceId: number | string) => {
      return {
        payload: resourceId,
        status: null
      };
    },
    request: (action: { payload: number | string }) => {
      return axios
        .get(buildURL(action.payload))
        .then(response => normalizeResponse(response));
    },
    reducer: (state: ResourceModuleState, action): ResourceModuleState => {
      switch (action.status) {
        case 'success': {
          const { data } = action.payload;

          return {
            ...state,
            resourcesById: {
              ...state.resourcesById,
              [data.id]: data.attributes
            }
          };
        }
      }

      return state;
    }
  });
}

function createDestroyResourceOperation({
  buildURL,
  normalizeResponse = response => response.data
}: {
  buildURL: (id: string | number) => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
    actionType: 'DESTROY_RESOURCE',
    actionCreator: (resourceId: number | string) => {
      return {
        payload: resourceId,
        status: null
      };
    },
    request: (action: { payload: number | string }) => {
      return axios.delete(buildURL(action.payload)).then(() => ({
        data: {
          id: action.payload
        }
      }));
    },
    reducer: (state: ResourceModuleState, action): ResourceModuleState => {
      switch (action.status) {
        case 'success': {
          const { data } = action.payload;

          return removeResourceFromState(state, data.id);
        }
      }

      return state;
    }
  });
}

function removeResourceFromState(
  state: ResourceModuleState,
  resourceId: number | string
): ResourceModuleState {
  const resourcesById = {
    ...state.resourcesById
  };

  delete resourcesById[resourceId.toString()];

  return {
    ...state,
    resourcesById
  };
}
