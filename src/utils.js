// @flow

import type { ResourceID, ResourceModuleState } from './types';

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

export function removeResource(
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
