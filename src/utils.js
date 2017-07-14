// @flow

import type {
  ResourceType,
  ResourceID,
  ResourceStatus,
  ResourceModuleState,
  JSONAPIDocument,
  JSONAPIResource
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
  resource: JSONAPIResource
): ResourceModuleState {
  if (state.resources[resource.type] == null) {
    return state;
  }

  const resources = {
    ...state.resources,
    [resource.type]: {
      ...state.resources[resource.type],
      [resource.id.toString()]: { id: resource.id, ...resource.attributes }
    }
  };

  const resourceRelationships = {
    ...state.resourceRelationships,
    [resource.type]: {
      ...state.resourceRelationships[resource.type],
      [resource.id.toString()]: resource.relationships || null
    }
  };

  return {
    ...state,
    resources,
    resourceRelationships
  };
}

export function addResources(
  state: ResourceModuleState,
  resources: JSONAPIDocument
): ResourceModuleState {
  if (resources.data instanceof Array) {
    resources.data.forEach(resource => {
      state = addResource(state, resource);
    });
  } else {
    state = addResource(state, resources.data);
  }

  if (resources.included instanceof Array) {
    resources.included.forEach(resource => {
      state = addResource(state, resource);
    });
  }

  return state;
}

export function replaceResources(
  state: ResourceModuleState,
  data: Array<JSONAPIResource>
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
