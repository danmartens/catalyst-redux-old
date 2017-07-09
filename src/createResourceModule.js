// @flow

import axios from 'axios';

import createModule from './createModule';
import createAsyncOperation from './createAsyncOperation';

export type ResourceModuleState = {
  resourcesById: { [string]: Object }
};

export default function createResourceModule(
  actionTypePrefix: string,
  options: {
    resourceURL: (id: string | number) => string,
    resourcesURL: () => string
  }
) {
  const operationsMap = {
    findResource: createFindResourceOperation({
      resourceURL: options.resourceURL
    }),
    createResource: createCreateResourceOperation({
      resourcesURL: options.resourcesURL
    }),
    destroyResource: createDestroyResourceOperation({
      resourceURL: options.resourceURL
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
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: string | number) => string,
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

function createCreateResourceOperation({
  resourcesURL,
  normalizeResponse = response => response.data
}: {
  resourcesURL: (id?: string | number) => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
    actionType: 'CREATE_RESOURCE',
    actionCreator: (resourceAttributes: Object) => {
      return {
        payload: resourceAttributes,
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

function createDestroyResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: string | number) => string,
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

function addResource(
  state: ResourceModuleState,
  resourceId: number | string,
  resourceAttributes: Object
): ResourceModuleState {
  const resourcesById = {
    ...state.resourcesById,
    [resourceId.toString()]: resourceAttributes
  };

  return {
    ...state,
    resourcesById
  };
}

function removeResource(
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
