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

const { findAll } = resources.actions;
const { getAll } = resources.selectors;

afterEach(axios.__clearRegisteredResponses);

test('FindAllResourcesOperation success', () => {
  axios.__registerResponse('GET', '/api/posts', {
    data: [
      {
        id: 1,
        attributes: { title: 'First Post' }
      },
      {
        id: 2,
        attributes: { title: 'Second Post' }
      }
    ]
  });

  const store = storeForModule(resources);

  store.dispatch(findAll('posts'));

  return nextStoreState(store).then(state => {
    expect(getAll(state, 'posts')).toEqual([
      {
        id: 1,
        title: 'First Post'
      },
      {
        id: 2,
        title: 'Second Post'
      }
    ]);
  });
});
