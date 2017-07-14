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

const { update } = resources.actions;
const { getResource, getStatus } = resources.selectors;

afterEach(axios.__clearRegisteredResponses);

test('UpdateResourceOperation', () => {
  axios.__registerResponse('PATCH', '/api/posts/1', data => {
    return {
      data: {
        id: 1,
        type: 'posts',
        attributes: data
      }
    };
  });

  const store = storeForModule(resources, {
    resources: {
      resources: {
        posts: {
          '1': { id: 1, title: 'First Post' },
          '2': { id: 2, title: 'Second Post' }
        }
      },
      resourceStatus: {}
    }
  });

  store.dispatch(
    update('posts', 1, {
      title: 'Edited Post'
    })
  );

  expect(getStatus(store.getState(), 'posts', 1)).toEqual('update.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 'posts', 1)).toEqual('update.success');

    expect(getResource(state, 'posts', 1)).toEqual({
      id: 1,
      title: 'Edited Post'
    });

    expect(getResource(state, 'posts', 2)).toEqual({
      id: 2,
      title: 'Second Post'
    });
  });
});
