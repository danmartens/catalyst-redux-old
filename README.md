# Catalyst Redux

## Operations

The simplest Operation is just an action type and a reducer:

```javascript
const increment = Operation({
  actionType: 'INCREMENT',
  reducer: state => state + 1
})
```

You can customize the action creator if you want:

```javascript
const increment = Operation({
  actionType: 'INCREMENT',
  actionCreator: amount => ({ payload: { amount } }),
  reducer: (state, action) => state + action.payload.amount
});
```

## AsyncOperations

Sometimes an Operation needs to handle some asynchronous logic (e.g. making a request to your API and then storing the response). This is almost as simple to write as a synchronous operation:

```javascript
const fetchArticles = AsyncOperation({
  actionType: 'FETCH_ARTICLES',
  reducer: (state, action) => {
    switch (action.status) {
      case 'pending': {
        return {
          ...state,
          fetchStatus: 'pending'
        };
      }

      case 'success': {
        return {
          ...state,
          fetchStatus: 'success',
          articles: action.payload.data
        };
      }

      case 'error': {
        return {
          ...state,
          fetchStatus: 'error'
        };
      }
    }

    return state;
  },
  request: () => axios.get('/api/articles').then(({ data }) => data)
});
```

## Modules

Operations can be composed into a Module. A Module contains the reducer, saga, action creators, and selectors for a specific "slice" of your application state.

Here's a counter Module with an intial state of `0`:

```javascript
const counter = Module(
  'counter',
  {
    increment: Operation({
      actionType: 'INCREMENT',
      reducer: state => state + 1
    }),
    decrement: Operation({
      actionType: 'DECREMENT',
      reducer: state => state - 1
    })
  },
  {
    getState: (state) => state
  }
)(0);
```

The created module has the following API:

```javascript
counter.reducer()
counter.saga()
counter.actions.increment()
counter.actions.decrement()
counter.selectors.getState()
```

## ResourceModules

ResourceModules consist of a predefined group of AsyncOperations that allow you
to interact with a JSON API.

ResourceModules require information about the types of resources you want to
interact with and how to construct requests for them:

```javascript
const blog = ResourceModule('blog', {
  resources: {
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
```

This would provide you with the following API for interacting with posts and
comments:

```javascript
blog.actions.findAll(type);
blog.actions.find(type, id);
blog.actions.create(type, attributes);
blog.actions.update(type, id, attributes);
blog.actions.destroy(type, id);

blog.selectors.getAll(type);
blog.selectors.getResource(type, id);
blog.selectors.getStatus(type, id);
```

In this case, the "type" argument could be either `'posts'` or `'comments'`.
