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

const { findAll } = posts.actions;
const { getAll } = posts.selectors;

afterEach(axios.__clearRegisteredResponses);

test('FindAllResourcesOperation success', () => {
  axios.__registerResponse('GET', '/api/posts', {
    data: [
      {
        id: '1',
        attributes: { title: 'First Post' }
      },
      {
        id: '2',
        attributes: { title: 'Second Post' }
      }
    ]
  });

  const store = storeForModule(posts);

  store.dispatch(findAll());

  return nextStoreState(store).then(state => {
    expect(getAll(state)).toEqual([
      {
        title: 'First Post'
      },
      {
        title: 'Second Post'
      }
    ]);
  });
});
