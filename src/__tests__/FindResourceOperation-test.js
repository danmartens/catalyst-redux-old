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

const { find } = resources.actions;
const { getResource, getStatus, getRelated } = resources.selectors;

afterEach(axios.__clearRegisteredResponses);

test('FindResourceOperation success', () => {
  axios.__registerResponse('GET', '/api/posts/1', {
    data: {
      id: 1,
      type: 'posts',
      attributes: { title: 'Test Post' }
    },
    included: [
      {
        id: 1,
        type: 'comments',
        attributes: { content: 'First!' }
      }
    ]
  });

  const store = storeForModule(resources);

  store.dispatch(find('posts', 1));

  expect(getStatus(store.getState(), 'posts', 1)).toEqual('find.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 'posts', 1)).toEqual('find.success');
    expect(getResource(state, 'posts', 1)).toEqual({
      id: 1,
      title: 'Test Post'
    });
  });
});

test('FindResourceOperation deserializes included resources', () => {
  axios.__registerResponse('GET', '/api/posts/1', {
    data: {
      id: 1,
      type: 'posts',
      attributes: { title: 'Test Post' },
      relationships: {
        author: { type: 'users', id: 1 },
        comments: [{ type: 'comments', id: 1 }, { type: 'comments', id: 2 }]
      }
    },
    included: [
      {
        id: 1,
        type: 'users',
        attributes: { name: 'Jane Doe' }
      },
      {
        id: 1,
        type: 'comments',
        attributes: { content: 'First!' }
      },
      {
        id: 2,
        type: 'comments',
        attributes: { content: 'Meaningful comment' }
      }
    ]
  });

  const store = storeForModule(resources);

  store.dispatch(find('posts', 1));

  return nextStoreState(store).then(state => {
    expect(getRelated(state, 'posts', 1, 'author')).toEqual({
      id: 1,
      name: 'Jane Doe'
    });

    expect(getRelated(state, 'posts', 1, 'comments')).toEqual([
      {
        id: 1,
        content: 'First!'
      },
      {
        id: 2,
        content: 'Meaningful comment'
      }
    ]);
  });
});

test('FindResourceOperation error', () => {
  axios.__registerResponse('GET', '/api/posts/1', {}, 404);

  const store = storeForModule(resources);

  store.dispatch(find('posts', 1));

  expect(getStatus(store.getState(), 'posts', 1)).toEqual('find.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 'posts', 1)).toEqual('find.error');
    expect(getResource(state, 'posts', 1)).toEqual(null);
  });
});
