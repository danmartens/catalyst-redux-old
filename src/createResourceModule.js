// @flow

import axios from 'axios';

import createModule from './createModule';
import createAsyncOperation from './createAsyncOperation';

export type ResourceID = string | number;

export type ResourceModuleState = {
  resourcesById: { [string]: Object }
};

export default function createResourceModule(
  actionTypePrefix: string,
  options: {
    resourceURL: (id: ResourceID) => string,
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
    updateResource: createUpdateResourceOperation({
      resourceURL: options.resourceURL
    }),
    destroyResource: createDestroyResourceOperation({
      resourceURL: options.resourceURL
    })
  };

  const selectors = {
    getResource(state: ResourceModuleState, id: ResourceID) {
      return state.resourcesById[id.toString()];
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
  resourceURL: (id: ResourceID) => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
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

function createCreateResourceOperation({
  resourcesURL,
  normalizeResponse = response => response.data
}: {
  resourcesURL: () => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
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

function createUpdateResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: ResourceID) => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
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

function createDestroyResourceOperation({
  resourceURL,
  normalizeResponse = response => response.data
}: {
  resourceURL: (id: string | number) => string,
  normalizeResponse?: Function
}) {
  return createAsyncOperation({
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

function addResource(
  state: ResourceModuleState,
  resourceId: ResourceID,
  attributes: Object
): ResourceModuleState {
  const resourcesById = {
    ...state.resourcesById,
    [resourceId.toString()]: attributes
  };

  return {
    ...state,
    resourcesById
  };
}

function removeResource(
  state: ResourceModuleState,
  resourceId: ResourceID
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
