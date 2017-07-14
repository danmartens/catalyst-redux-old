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
  RelationshipName,
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

    getResource,

    getRelated(
      state: ResourceModuleState,
      type: ResourceType,
      id: ResourceID,
      relationshipName: RelationshipName
    ): null | Object | Array<?Object> {
      if (
        state.resourceRelationships[type] == null ||
        state.resourceRelationships[type][id] == null
      ) {
        return null;
      }

      const relationship =
        state.resourceRelationships[type][id][relationshipName];

      if (relationship == null) {
        return null;
      }

      if (relationship instanceof Array) {
        return relationship.map(r => {
          return getResource(state, r.type, r.id);
        });
      } else {
        return getResource(state, relationship.type, relationship.id);
      }
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
    resourceRelationships: buildResourceTypesMap(resourceTypes),
    resourceStatus: buildResourceTypesMap(resourceTypes)
  });
}

function getResource(
  state: ResourceModuleState,
  type: ResourceType,
  id: ResourceID
): null | Object {
  if (state.resources[type] == null) {
    return null;
  }

  return state.resources[type][id.toString()] || null;
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
