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

const { update } = posts.actions;
const { getResource, getStatus } = posts.selectors;

afterEach(axios.__clearRegisteredResponses);

test('UpdateResourceOperation', () => {
  axios.__registerResponse('PATCH', '/api/posts/1', data => {
    return {
      data: {
        id: 1,
        attributes: data
      }
    };
  });

  const store = storeForModule(posts, {
    posts: {
      resources: {
        '1': { id: 1, title: 'First Post' },
        '2': { id: 2, title: 'Second Post' }
      },
      resourceStatus: {}
    }
  });

  store.dispatch(
    update(1, {
      title: 'Edited Post'
    })
  );

  expect(getStatus(store.getState(), 1)).toEqual('update.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('update.success');

    expect(getResource(state, 1)).toEqual({
      id: 1,
      title: 'Edited Post'
    });

    expect(getResource(state, 2)).toEqual({
      id: 2,
      title: 'Second Post'
    });
  });
});
