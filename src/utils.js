// @flow

import type {
  ResourceType,
  ResourceID,
  ResourceStatus,
  ResourceModuleState
} from './types';

export function reducerForActionType(
  reducer: (state: *, action: *) => *,
  actionType: string
): * {
  return (state: *, action): * => {
    if (action.type === actionType) {
      return reducer(state, action);
    } else {
      return state;
    }
  };
}

export function addResource(
  state: ResourceModuleState,
  type: ResourceType,
  id: ResourceID,
  attributes: Object
): ResourceModuleState {
  if (state.resources[type] == null) {
    return state;
  }

  const resources = {
    ...state.resources,
    [type]: {
      ...state.resources[type],
      [id.toString()]: { id, ...attributes }
    }
  };

  return {
    ...state,
    resources
  };
}

export function replaceResources(
  state: ResourceModuleState,
  data: Array<{ id: ResourceID, attributes: Object }>
): ResourceModuleState {
  const resources = data.reduce((resources, resource) => {
    return {
      ...resources,
      [resource.id]: { id: resource.id, ...resource.attributes }
    };
  }, {});

  return {
    ...state,
    resources
  };
}

export function removeResource(
  state: ResourceModuleState,
  type: ResourceType,
  id: ResourceID
): ResourceModuleState {
  if (state.resources[type] == null) {
    return state;
  }

  const resources = {
    ...state.resources,
    [type]: {
      ...state.resources[type]
    }
  };

  delete resources[type][id.toString()];

  return {
    ...state,
    resources
  };
}

export function setResourceStatus(
  state: ResourceModuleState,
  type: ResourceType,
  id: ResourceID,
  status: ResourceStatus
) {
  if (state.resources[type] == null) {
    return state;
  }

  return {
    ...state,
    resourceStatus: {
      ...state.resourceStatus,
      [type]: {
        ...state.resourceStatus[type],
        [id]: status
      }
    }
  };
}
