// @flow

import { values } from 'lodash';
import axios from 'axios';

import Module from './Module';
import FindAllResourcesOperation from './FindAllResourcesOperation';
import FindResourceOperation from './FindResourceOperation';
import CreateResourceOperation from './CreateResourceOperation';
import UpdateResourceOperation from './UpdateResourceOperation';
import DestroyResourceOperation from './DestroyResourceOperation';

import type {
  ResourceID,
  ResourceType,
  ResourceStatus,
  ResourceModuleState,
  ResourcesConfig
} from './types';

export default function ResourceModule(
  moduleName: string,
  options: {
    resources: ResourcesConfig
  }
) {
  const operationsMap = {
    findAll: FindAllResourcesOperation({
      resources: options.resources
    }),
    find: FindResourceOperation({
      resources: options.resources
    }),
    create: CreateResourceOperation({
      resources: options.resources
    }),
    update: UpdateResourceOperation({
      resources: options.resources
    }),
    destroy: DestroyResourceOperation({
      resources: options.resources
    })
  };

  const selectors = {
    getAll(state: ResourceModuleState, type: ResourceType) {
      return values(state.resources);
    },

    getResource(
      state: ResourceModuleState,
      type: ResourceType,
      id: ResourceID
    ): null | Object {
      if (state.resources[type] == null) {
        return null;
      }

      return state.resources[type][id.toString()] || null;
    },

    getStatus(
      state: ResourceModuleState,
      type: ResourceType,
      id: ResourceID
    ): ResourceStatus {
      if (state.resources[type] == null) {
        return null;
      }

      return state.resourceStatus[type][id.toString()] || null;
    }
  };

  const resourceTypes = Object.keys(options.resources);

  return Module(moduleName, operationsMap, selectors)({
    resources: buildResourceTypesMap(resourceTypes),
    resourceStatus: buildResourceTypesMap(resourceTypes)
  });
}

/**
 * Builds a new object for storing data broken down by resource types.
 */
function buildResourceTypesMap(
  resourceTypes: Array<string>
): { [string]: Object } {
  const map = {};

  resourceTypes.forEach(resourceType => {
    map[resourceType] = {};
  });

  return map;
}
