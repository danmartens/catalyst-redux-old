// @flow

type Operation<ActionCreator: *, Reducer: *> = (
  actionTypePrefix: string
) => { actionCreator: ActionCreator, reducer: Reducer };

export default function createOperation<ActionCreator: *, Reducer: *>({
  actionType,
  actionCreator = () => ({}),
  reducer
}: {
  actionType: string,
  actionCreator?: ActionCreator,
  reducer: Reducer
}): Operation<ActionCreator, Reducer> {
  return (actionTypePrefix: string) => {
    const type = `${actionTypePrefix}/${actionType}`;

    const newActionCreator = (...args: Array<*>) => ({
      type,
      ...actionCreator(...args)
    });

    const newReducer = (state, action) => {
      if (action.type === type) {
        return reducer(state, action);
      } else {
        return state;
      }
    };

    return {
      actionCreator: ((newActionCreator: any): ActionCreator),
      reducer: ((newReducer: any): Reducer)
    };
  };
}
