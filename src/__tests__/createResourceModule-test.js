// @flow

declare var test: Function;
declare var expect: Function;
declare var afterEach: Function;

import axios from 'axios';
import { storeForModule, nextStoreState } from '../test-utils';

import createResourceModule from '../createResourceModule';

const posts = createResourceModule('posts', {
  buildURL: id => `/api/posts/${id}`
});

afterEach(axios.__clearRegisteredResponses);

test('async operation reducer', () => {
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
