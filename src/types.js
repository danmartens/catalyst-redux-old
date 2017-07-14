// @flow

export type ResourceID = string | number;
export type ResourceType = string;

export type ResourceStatus =
  | null
  | 'find.pending'
  | 'find.success'
  | 'find.error'
  | 'create.pending'
  | 'create.success'
  | 'create.error'
  | 'update.pending'
  | 'update.success'
  | 'update.error'
  | 'destroy.pending'
  | 'destroy.success'
  | 'destroy.error';

export type ResourceModuleState = {
  resources: { [ResourceType]: { [ResourceID]: Object } },
  resourceStatus: { [ResourceType]: { [ResourceID]: ResourceStatus } }
};

export type ResourcesConfig = {
  [ResourceType]: {|
    resourceURL: (id: ResourceID) => string,
    resourcesURL: () => string
  |}
};
