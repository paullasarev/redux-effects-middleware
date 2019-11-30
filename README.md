# redux-effects-middleware

### Getting started

```bash
> npm i --save-dev redux-effects-middleware
```

```js
import { createStore, applyMiddleware } from 'redux';
import { createMiddleware } from 'redux-effects-middleware';

const effectsOptions = {

};

const store = createStore(
  rootReducer,
  applyMiddleware(
    createMiddleware(effectsOptions),
  ),
);

```

###init effects

```js
export function initEffects(effects, options) {
  // call effects.XXX to init effects);
}

const effectsOptions = {
  initEffects,
};
```

### takeEvery effect

```js
async function onConfigSuccess(effects, action) {
  const { user: { id } } = action.payload;
  return dispatch(getUserAction(id));
}

export function initEffects(effects, options) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

### dispatch actions

### select store state

### delay effect

### take effect



