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

const {
  findResource,
  createResource,
  updateResource,
  destroyResource
} = posts.actions;
const { getResource, getStatus } = posts.selectors;

afterEach(axios.__clearRegisteredResponses);

test('CreateResourceOperation', () => {
  axios.__registerResponse('POST', '/api/posts', data => {
    return {
      data: {
        id: 1,
        attributes: data
      }
    };
  });

  const store = storeForModule(posts);

  store.dispatch(createResource({ title: 'A New Post' }));

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('create.success');

    expect(getResource(state, 1)).toEqual({
      title: 'A New Post'
    });
  });
});

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
        '1': { title: 'First Post' },
        '2': { title: 'Second Post' }
      },
      resourceStatus: {}
    }
  });

  store.dispatch(
    updateResource(1, {
      title: 'Edited Post'
    })
  );

  expect(getStatus(store.getState(), 1)).toEqual('update.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('update.success');

    expect(getResource(state, 1)).toEqual({
      title: 'Edited Post'
    });

    expect(getResource(state, 2)).toEqual({
      title: 'Second Post'
    });
  });
});

test('DestroyResourceOperation', () => {
  axios.__registerResponse('DELETE', '/api/posts/1', {});

  const store = storeForModule(posts, {
    posts: {
      resources: {
        '1': { title: 'First Post' },
        '2': { title: 'Second Post' }
      },
      resourceStatus: {}
    }
  });

  store.dispatch(destroyResource(1));

  expect(getStatus(store.getState(), 1)).toEqual('destroy.pending');

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('destroy.success');
    expect(getResource(state, 1)).toEqual(undefined);
    expect(getResource(state, 2)).toEqual({
      title: 'Second Post'
    });
  });
});
