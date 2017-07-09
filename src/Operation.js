// @flow

import { reducerForActionType } from './utils';

type OperationType<ActionCreator, Reducer> = (
  actionTypePrefix: string
) => { actionCreator: ActionCreator, reducer: Reducer };

export default function Operation<ActionCreator: *, Reducer: *>({
  actionType,
  actionCreator = (payload = null) => ({ payload }),
  reducer
}: {
  actionType: string,
  actionCreator?: ActionCreator,
  reducer: Reducer
}): OperationType<ActionCreator, Reducer> {
  return (actionTypePrefix: string) => {
    const type = `${actionTypePrefix}/${actionType}`;

    const newActionCreator = (...args: Array<*>) => ({
      type,
      ...actionCreator(...args)
    });

    return {
      actionCreator: ((newActionCreator: any): ActionCreator),
      reducer: ((reducerForActionType(reducer, type): any): Reducer)
    };
  };
}
