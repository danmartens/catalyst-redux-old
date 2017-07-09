// @flow

import axios from 'axios';

import Module from './Module';
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
    findResource: FindResourceOperation({
      resourceURL: options.resourceURL
    }),
    createResource: CreateResourceOperation({
      resourcesURL: options.resourcesURL
    }),
    updateResource: UpdateResourceOperation({
      resourceURL: options.resourceURL
    }),
    destroyResource: DestroyResourceOperation({
      resourceURL: options.resourceURL
    })
  };

  const selectors = {
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
