// @flow

declare var test: Function;
declare var expect: Function;
declare var afterEach: Function;

import axios from 'axios';
import { storeForModule, nextStoreState } from '../test-utils';

import ResourceModule from '../ResourceModule';

const resources = ResourceModule('resources', {
  resources: {
    users: {
      resourcesURL: () => '/api/users',
      resourceURL: id => `/api/users/${id}`
    },
    posts: {
      resourcesURL: () => '/api/posts',
      resourceURL: id => `/api/posts/${id}`
    },
    comments: {
      resourcesURL: () => '/api/comments',
      resourceURL: id => `/api/comments/${id}`
    }
  }
});

const { findAll } = resources.actions;
const { getAll, getRelated } = resources.selectors;

afterEach(axios.__clearRegisteredResponses);

test('FindAllResourcesOperation success', () => {
  axios.__registerResponse('GET', '/api/posts', {
    data: [
      {
        id: 1,
        type: 'posts',
        attributes: { title: 'First Post' }
      },
      {
        id: 2,
        type: 'posts',
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

test('FindAllResourcesOperation deserializes included resources', () => {
  axios.__registerResponse('GET', '/api/posts', {
    data: [
      {
        id: 1,
        type: 'posts',
        attributes: { title: 'First Post' },
        relationships: {
          author: {
            data: { type: 'users', id: 1 }
          }
        }
      },
      {
        id: 2,
        type: 'posts',
        attributes: { title: 'Second Post' },
        relationships: {
          author: {
            data: { type: 'users', id: 1 }
          }
        }
      }
    ],
    included: [
      {
        id: 1,
        type: 'users',
        attributes: { name: 'Jane Doe' },
        relationships: {
          posts: {
            data: [{ type: 'posts', id: 1 }]
          }
        }
      },
      {
        id: 2,
        type: 'users',
        attributes: { name: 'John Smith' },
        relationships: {
          posts: {
            data: [{ type: 'posts', id: 2 }]
          }
        }
      }
    ]
  });

  const store = storeForModule(resources);

  store.dispatch(findAll('posts'));

  return nextStoreState(store).then(state => {
    expect(getRelated(state, 'posts', 1, 'author')).toEqual({
      id: 1,
      name: 'Jane Doe'
    });

    expect(getRelated(state, 'users', 1, 'posts')).toEqual([
      { id: 1, title: 'First Post' }
    ]);
  });
});
