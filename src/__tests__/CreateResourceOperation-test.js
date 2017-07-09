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

const { create, destroy } = posts.actions;
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

  store.dispatch(create({ title: 'A New Post' }));

  return nextStoreState(store).then(state => {
    expect(getStatus(state, 1)).toEqual('create.success');

    expect(getResource(state, 1)).toEqual({
      id: 1,
      title: 'A New Post'
    });
  });
});
