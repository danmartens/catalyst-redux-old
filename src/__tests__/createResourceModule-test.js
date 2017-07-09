// @flow

declare var test: Function;
declare var expect: Function;
declare var afterEach: Function;

import axios from 'axios';
import { storeForModule, nextStoreState } from '../test-utils';

import createResourceModule from '../createResourceModule';

const posts = createResourceModule('posts', {
  resourcesURL: () => '/api/posts',
  resourceURL: id => `/api/posts/${id}`
});

afterEach(axios.__clearRegisteredResponses);

test('findResource action', () => {
  axios.__registerResponse('GET', '/api/posts/123', {
    data: {
      id: '123',
      attributes: { title: 'Test Post' }
    }
  });

  const store = storeForModule(posts);

  store.dispatch(posts.actions.findResource(123));

  return nextStoreState(store).then(state => {
    expect(posts.selectors.getResource(state, 123)).toEqual({
      title: 'Test Post'
    });
  });
});

test('createResource action', () => {
  axios.__registerResponse('POST', '/api/posts', data => {
    return {
      data: {
        id: 1,
        attributes: data
      }
    };
  });

  const store = storeForModule(posts);

  store.dispatch(posts.actions.createResource({ title: 'A New Post' }));

  return nextStoreState(store).then(state => {
    expect(posts.selectors.getResource(state, 1)).toEqual({
      title: 'A New Post'
    });
  });
});

test('updateResource action', () => {
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
      resourcesById: {
        '1': { title: 'First Post' },
        '2': { title: 'Second Post' }
      }
    }
  });

  store.dispatch(
    posts.actions.updateResource(1, {
      title: 'Edited Post'
    })
  );

  return nextStoreState(store).then(state => {
    expect(posts.selectors.getResource(state, 1)).toEqual({
      title: 'Edited Post'
    });

    expect(posts.selectors.getResource(state, 2)).toEqual({
      title: 'Second Post'
    });
  });
});

test('destroyResource action', () => {
  axios.__registerResponse('DELETE', '/api/posts/1', {});

  const store = storeForModule(posts, {
    posts: {
      resourcesById: {
        '1': { title: 'First Post' },
        '2': { title: 'Second Post' }
      }
    }
  });

  store.dispatch(posts.actions.destroyResource(1));

  return nextStoreState(store).then(state => {
    expect(posts.selectors.getResource(state, 1)).toEqual(undefined);
    expect(posts.selectors.getResource(state, 2)).toEqual({
      title: 'Second Post'
    });
  });
});
