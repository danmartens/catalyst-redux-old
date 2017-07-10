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
