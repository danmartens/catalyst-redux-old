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

const { destroy } = resources.actions;
const { getResource, getStatus } = resources.selectors;

afterEach(axios.__clearRegisteredResponses);

test('DestroyResourceOperation', () => {
  axios.__registerResponse('DELETE', '/api/posts/1', {});

  const store = storeForModule(resources, {
    resources: {
      resources: {
        posts: {
          '1': { id: 1, title: 'First Post' },
          '2': { id: 2, title: 'Second Post' }
        }
      },
      resourceStatus: { posts: {} }
    }
  });

  store.dispatch(destroy('posts', 1));

  expect(getStatus(store.getState(), 'posts', 1)).toEqual('destroy.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 'posts', 1)).toEqual('destroy.success');
    expect(getResource(state, 'posts', 1)).toEqual(null);
    expect(getResource(state, 'posts', 2)).toEqual({
      id: 2,
      title: 'Second Post'
    });
  });
});
