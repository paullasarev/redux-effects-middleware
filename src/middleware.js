import { isFunction, isUndefined, isArray, map } from 'lodash';
import uuid4 from 'uuid/v4';

function isPromise (value) {
  return !!value && 'function' === typeof value.then;
}

export class Effects {

  constructor(dispatch, getState, options) {
    this._dispatch = dispatch;
    this.getState = getState;
    this._everyActions = {};
    this._onceActions = {};
    this._setTimeout = options.setTimeout || setTimeout;
  }

  _onAction(action) {
    const everyHandler = this._everyActions[action.type];
    if (isFunction(everyHandler)) {
      return everyHandler(this, action);
    }
    const onceAction = this._onceActions[action.type];
    if (onceAction) {
      const {actionType, resolve} = onceAction;
      actionType.forEach(type => {
        delete this._onceActions[type];
      })
      return resolve(action);
    }
    return undefined;
  }

  _onTake = (actionType) => (resolve, reject) => {
    if (isArray(actionType)) {
      actionType.forEach(type => {
        this._onceActions[type] = {actionType, resolve};
      });
    } else {
      this._onceActions[actionType] = {actionType: [actionType], resolve};
    }
  }

  dispatch = (...args) => {
    const result = this._dispatch(...args);
    if (isPromise(result)) {
      return result;
    }
    return Promise.resolve(result);
  }

  select = (selector = undefined) => {
    if (!isUndefined(selector)) {
      return selector(this.getState());
    }

    return this.getState();
  }

  takeEvery = (actionType, handler) => {
    this._everyActions[actionType] = handler;
  }

  take = async (actionType) => {
    return new Promise(this._onTake(actionType));
  }

  delay = async (timeout, payload, ...args) => {
    return new Promise((resolve, reject) => {
      this._setTimeout(() => {
        try {
          if (isFunction(payload)) {
            const result = payload(...args);
            if (isPromise(result)) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } else {
            resolve(payload);
          }
        } catch (err) {
          reject(err);
        }
      }, timeout);
    });
  }

  all = async (actions) => {
    return Promise.all(actions);
  }

  race = async (actions) => {
    return Promise.race(actions);
  }

  throttle = async (timeout, pattern, handler, ...args) => {
    while (true) {
      const action = await this.take(pattern);
      await handler(this, ...args, action);
      await this.delay(timeout);
    }
  }

  debounce = async (timeout, pattern, handler, ...args) => {
    while (true) {
      let action = await this.take(pattern);
  
      while (true) {
        const delayId = uuid4();
        const first = await this.race([this.delay(timeout, delayId), this.take(pattern)]);  
  
        if (first === delayId) {
          await handler(this, ...args, action);
          break;
        } else {
          action = first;
        }
      }
    }
  }
}

export function createMiddleware(initEffects, options={}) {
  return ({ dispatch, getState }) => {
    const effects = new Effects(dispatch, getState, options);
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


