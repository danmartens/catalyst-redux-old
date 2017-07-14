// @flow

declare var test: Function;
declare var expect: Function;
declare var afterEach: Function;

import axios from 'axios';
import { storeForModule, nextStoreState } from '../test-utils';

import ResourceModule from '../ResourceModule';

const resources = ResourceModule('resources', {
  resources: {
    posts: {
      resourcesURL: () => '/api/posts',
      resourceURL: id => `/api/posts/${id}`
    }
  }
});

const { create, destroy } = resources.actions;
const { getResource, getStatus } = resources.selectors;

afterEach(axios.__clearRegisteredResponses);

test('CreateResourceOperation', () => {
  axios.__registerResponse('POST', '/api/posts', data => {
    return {
      data: {
        id: 1,
        type: 'posts',
        attributes: data.attributes
      }
    };
  });

  const store = storeForModule(resources);

  store.dispatch(create('posts', { title: 'A New Post' }));

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 'posts', 1)).toEqual('create.success');

    expect(getResource(state, 'posts', 1)).toEqual({
      id: 1,
      title: 'A New Post'
    });
  });
});
