import { isFunction, isUndefined, isArray, map } from 'lodash';

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

  _onAction(action) {
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

  _onTake = (actionType) => (resolve, reject) => {
    if (isArray(actionType)) {
      actionType.forEach(type => {
        this.onceActions[type] = {actionType, resolve};
      });
    } else {
      this.onceActions[actionType] = {actionType: [actionType], resolve};
    }
  }

  select(selector = undefined) {
    if (!isUndefined(selector)) {
      return selector(this.getState());
    }

    return this.getState();
  }

  takeEvery(actionType, handler) {
    this.everyActions[actionType] = handler;
  }

  async take(actionType) {
    return new Promise(this._onTake(actionType));
  }

  async delay(timeout, payload) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(payload);
      }, timeout);
    });
  }

  async timeout(timeout, func) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = func();
        try {
          if (result.then) {
            result.then(resolve, reject)
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      }, timeout);
    });
  }

  async all(actionTypes) {
    return Promise.all(map(actionTypes, actionType => {
      return new Promise(this._onTake(actionType));
    }));
  }

  async race(actions) {
    return Promise.race(actions);
  }
}

export function createMiddleware(initEffects) {
  return ({ dispatch, getState }) => {
    const effects = new Effects(dispatch, getState);
    initEffects(effects);
  
    return (next) => (action) => {
      const result = effects._onAction(action);
      if (result) {
        return result;
      }
      return next(action);
    }
  };
}


