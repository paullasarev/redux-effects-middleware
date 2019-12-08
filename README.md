# redux-effects-middleware

  * [Getting started](#getting-started)          
    + [installation](#installation)              
    + [instantiation](#instantiation)            
  * [effects](#effects)                          
    + [takeEvery](#takeevery)                    
    + [dispatch](#dispatch)                      
    + [select](#select)                          
    + [take](#take)                              
    + [takeLatest](#takelatest)                  
    + [delay](#delay)                            
    + [debounce](#debounce)                      
    + [throttle](#throttle)                      
  * [effect combinators](#effect-combinators)    
    + [all](#all)                                
    + [race](#race)                              

## Getting started
### installation

```bash
> npm i --save-dev redux-effects-middleware
```

### instantiation

```js
import { createStore, applyMiddleware } from 'redux';
import { createMiddleware } from 'redux-effects-middleware';

function initEffects(effects) {
  // call effects.XXX to init effects);
}

const store = createStore(
  rootReducer,
  applyMiddleware(
    createMiddleware(initEffects),
  ),
);

```

## effects
### takeEvery

```js
async function onConfigSuccess(effects, action) {
  console.log(action)
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

### dispatch
```js
async function onConfigSuccess(effects, action) {
  const { user: { id } } = action.payload;
  return effects.dispatch(getUserAction(id));
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

### select

```js
async function onConfigSuccess(effects, action) {
  const { app: { user: { id } } } = effects.select();
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

```js
async function onConfigSuccess(effects, action) {
  const { user: { id } } = effects.select(state->state.app);
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

### take

```js
async function onConfigSuccess(effects, action) {
  await effects.dispatch(apiAction());
  const action = await effects.take(API_ACTION_SUCCESS);
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

```js
async function onConfigSuccess(effects, action) {
  await effects.dispatch(apiAction());
  const action = await effects.take([API_ACTION_SUCCESS, API_ACTION_ERROR]);
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```

### delay

```js
async function onConfigSuccess(effects, action) {
  ...
  const payload = await effects.delay(1000, {id});
  // payload === {id}
  ...
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
```

### debounce

### throttle

## effect combinators
### all

```js
async function onConfigSuccess(effects, action) {
  effects.dispatch(apiAction());
  effects.dispatch(apiAction2());
  const actions = await effects.all([API_ACTION_SUCCESS, API_ACTION2_SUCCESS]);
}

export function initEffects(effects) {
  effects.takeEvery(CONFIG_SUCCESS_ACTION, onConfigSuccess);
}
```


### race


