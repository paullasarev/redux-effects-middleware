import { isFunction, isUndefined, isArray } from 'lodash';

function any(promises) {
  return new Promise( resolve => promises.forEach(
        promise => promise.then(resolve)));
}

export class Effects {

  constructor(dispatch, getState) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.everyActions = {};
    this.onceActions = {};
  }

  select(selector = undefined) {
    if (!isUndefined(selector)) {
      return selector(this.getState());
    }

    return this.getState();
  }

  onAction(action) {
    const everyHandler = this.everyActions[action.type];
    if (isFunction(everyHandler)) {
      return everyHandler(this, action);
    }
    const onceAction = this.onceActions[action.type];
    if (onceAction) {
      const {actionType, resolve} = onceAction;
      actionType.forEach(type => {
        delete this.onceActions[type];
      })
      return resolve(action);
    }
  }

  onTake = (actionType) => (resolve, reject) => {
    if (isArray(actionType)) {
      actionType.forEach(type => {
        this.onceActions[type] = {actionType, resolve};
      });
    } else {
      this.onceActions[actionType] = {actionType: [actionType], resolve};
    }
  }

  takeEvery(actionType, handler) {
    this.everyActions[actionType] = handler;
  }

  async take(actionType) {
    return new Promise(this.onTake(actionType));
  }
}

export function createMiddleware(initEffects) {
  return ({ dispatch, getState }) => {
    const effects = new Effects(dispatch, getState);
    initEffects(effects);
  
    return (next) => (action) => {
      const result = effects.onAction(action);
      if (result) {
        return result;
      }
      return next(action);
    }
  };
}


