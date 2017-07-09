// @flow

import type { ResourceID, ResourceStatus, ResourceModuleState } from './types';

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
  id: ResourceID,
  attributes: Object
): ResourceModuleState {
  const resources = {
    ...state.resources,
    [id.toString()]: { id, ...attributes }
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
  id: ResourceID
): ResourceModuleState {
  const resources = {
    ...state.resources
  };

  delete resources[id.toString()];

  return {
    ...state,
    resources
  };
}

export function setResourceStatus(
  state: ResourceModuleState,
  id: ResourceID,
  status: ResourceStatus
) {
  return {
    ...state,
    resourceStatus: {
      ...state.resourceStatus,
      [id]: status
    }
  };
}
