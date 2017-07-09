// @flow

import { values } from 'lodash';
import axios from 'axios';

import Module from './Module';
import FindAllResourcesOperation from './FindAllResourcesOperation';
import FindResourceOperation from './FindResourceOperation';
import CreateResourceOperation from './CreateResourceOperation';
import UpdateResourceOperation from './UpdateResourceOperation';
import DestroyResourceOperation from './DestroyResourceOperation';

import type { ResourceID, ResourceStatus, ResourceModuleState } from './types';

export default function ResourceModule(
  moduleName: string,
  options: {
    resourceURL: (id: ResourceID) => string,
    resourcesURL: () => string
  }
) {
  const operationsMap = {
    findAll: FindAllResourcesOperation({
      resourcesURL: options.resourcesURL
    }),
    find: FindResourceOperation({
      resourceURL: options.resourceURL
    }),
    create: CreateResourceOperation({
      resourcesURL: options.resourcesURL
    }),
    update: UpdateResourceOperation({
      resourceURL: options.resourceURL
    }),
    destroy: DestroyResourceOperation({
      resourceURL: options.resourceURL
    })
  };

  const selectors = {
    getAll(state: ResourceModuleState) {
      return values(state.resources);
    },

    getResource(state: ResourceModuleState, id: ResourceID) {
      return state.resources[id.toString()];
    },

    getStatus(state: ResourceModuleState, id: ResourceID): ResourceStatus {
      return state.resourceStatus[id.toString()];
    }
  };

  return Module(moduleName, operationsMap, selectors)({
    resources: {},
    resourceStatus: {}
  });
}
