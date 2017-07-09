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

const { find } = posts.actions;
const { getResource, getStatus } = posts.selectors;

afterEach(axios.__clearRegisteredResponses);

test('FindResourceOperation success', () => {
  axios.__registerResponse('GET', '/api/posts/1', {
    data: {
      id: 1,
      attributes: { title: 'Test Post' }
    }
  });

  const store = storeForModule(posts);

  store.dispatch(find(1));

  expect(getStatus(store.getState(), 1)).toEqual('find.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('find.success');
    expect(getResource(state, 1)).toEqual({
      id: 1,
      title: 'Test Post'
    });
  });
});

test('FindResourceOperation error', () => {
  axios.__registerResponse('GET', '/api/posts/1', {}, 404);

  const store = storeForModule(posts);

  store.dispatch(find(1));

  expect(getStatus(store.getState(), 1)).toEqual('find.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('find.error');
    expect(getResource(state, 1)).toEqual(undefined);
  });
});
