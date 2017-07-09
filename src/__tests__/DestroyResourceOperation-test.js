// @flow

declare var test: Function;
declare var expect: Function;
declare var afterEach: Function;

import axios from 'axios';
import { storeForModule, nextStoreState } from '../test-utils';

import ResourceModule from '../ResourceModule';

const posts = ResourceModule('posts', {
  resourcesURL: () => '/api/posts',
  resourceURL: id => `/api/posts/${id}`
});

const { destroy } = posts.actions;
const { getResource, getStatus } = posts.selectors;

afterEach(axios.__clearRegisteredResponses);

test('DestroyResourceOperation', () => {
  axios.__registerResponse('DELETE', '/api/posts/1', {});

  const store = storeForModule(posts, {
    posts: {
      resources: {
        '1': { id: 1, title: 'First Post' },
        '2': { id: 2, title: 'Second Post' }
      },
      resourceStatus: {}
    }
  });

  store.dispatch(destroy(1));

  expect(getStatus(store.getState(), 1)).toEqual('destroy.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('destroy.success');
    expect(getResource(state, 1)).toEqual(undefined);
    expect(getResource(state, 2)).toEqual({
      id: 2,
      title: 'Second Post'
    });
  });
});
