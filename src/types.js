// @flow

export type ResourceID = string | number;
export type ResourceType = string;
export type RelationshipName = string;
export type Relationship = { type: ResourceType, id: ResourceID };

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
  resourceRelationships: {
    [ResourceType]: {
      [ResourceID]: {
        [RelationshipName]: Relationship | Array<Relationship>
      }
    }
  },
  resourceStatus: { [ResourceType]: { [ResourceID]: ResourceStatus } }
};

export type ResourcesConfig = {
  [ResourceType]: {|
    resourceURL: (id: ResourceID) => string,
    resourcesURL: () => string,
    normalizeResponse?: (response: Object) => JSONAPIDocument
  |}
};

export type JSONAPIRelationships = {
  [RelationshipName]: {
    data: Relationship | Array<Relationship>
  }
};

export type JSONAPIResource = {|
  type: ResourceType,
  id: ResourceID,
  attributes: Object,
  relationships?: JSONAPIRelationships
|};

export type JSONAPIDocument = {|
  data: JSONAPIResource | Array<JSONAPIResource>,
  included?: Array<JSONAPIResource>
|};
