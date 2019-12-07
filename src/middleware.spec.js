import { omit } from 'lodash';

import {
  createMiddleware,
} from './index';

describe('middleware', ()=>{
  let lastActions;
  let theMiddleware;
  const dispatch = jest.fn((action) => {
    lastActions.push(action);
    theMiddleware(action);
  });
  let storeState = {};
  const getState = jest.fn(() => {
    return storeState;
  });
  const store =  {
    dispatch,
    getState,
  };
  const TEST_ACTION = 'TEST_ACTION';
  const testAction = {
    type: TEST_ACTION,
  };

  const TEST_ACTION2 = 'TEST_ACTION2';
  const testAction2 = {
    type: TEST_ACTION2,
  };

  const TEST_ACTION3 = 'TEST_ACTION3';
  const testAction3 = {
    type: TEST_ACTION3,
  };

  const next = jest.fn((action) => {
  });

  const onTestAction = jest.fn((effects, action) => {
    return 42;
  });

  const onTestActionAsync = jest.fn(async (effects, action) => {
    return Promise.resolve(42);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    lastActions = [];
    storeState = {};
  });

  function makeMiddleware(initEffects) {
    theMiddleware = createMiddleware(initEffects)(store)(next);
    return theMiddleware;
  }

  it('should call next middleware', async () => {
    const middleware = makeMiddleware(()=>{});
    await middleware(testAction);

    expect(next).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  describe('takeEvery', () => {

    it('should call takeEffects', async () => {
      
      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);

      expect(onTestAction).toHaveBeenCalledWith(expect.any(Object), testAction);
    });

    it('should call async takeEffects', async () => {
      
      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestActionAsync);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);

      expect(onTestActionAsync).toHaveBeenCalledWith(expect.any(Object), testAction);
    });

  });

  describe('dispatch', () => {
    it('should dispatch action', async () => {
  
      const onTestAction = jest.fn((effects, action) => {
        effects.dispatch(testAction2);
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);

      expect(onTestAction).toHaveBeenCalledWith(expect.any(Object), testAction);
      expect(dispatch).toHaveBeenCalledWith(testAction2);
    });

  });

  describe('select', () => {
    it('should return state', async () => {
      const app = { userId: 1};
      storeState ={ app };
  
      const onTestAction = jest.fn(async (effects, action) => {
        const state = await effects.select();
        expect(state).toBe(storeState);
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);

      expect(onTestAction).toHaveBeenCalledWith(expect.any(Object), testAction);
    });

    it('should select by selector', async () => {
      const app = { userId: 1};
      storeState ={ app };
  
      const onTestAction = jest.fn(async (effects, action) => {
        const state = await effects.select(state=>state.app);
        expect(state).toBe(storeState.app);
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);

      expect(onTestAction).toHaveBeenCalledWith(expect.any(Object), testAction);
    });

  });

  describe('take', () => {
    it('should take action', async (done) => {
  
      const onTestAction = jest.fn(async (effects, action) => {
        setTimeout(()=>{
          effects.dispatch(testAction2);
        }, 0);
        const nextAction = await effects.take(TEST_ACTION2);
        expect(nextAction).toBe(testAction2);
        done();
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);
    });

    it('should take one of action', async (done) => {
    
      const onTestAction = jest.fn(async (effects, action) => {
        setTimeout(()=>{
          effects.dispatch(testAction2);
        }, 0);
        const nextAction = await effects.take([TEST_ACTION2, 'TEST_ACTION3']);
        expect(nextAction).toBe(testAction2);
        done();
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);
    });

  });
  describe('delay', () => {
    it('should delay for timeout', async (done) => {
 
      const onTestAction = jest.fn(async (effects, action) => {
        const timeout = 50;
        const hrstart = process.hrtime();
        await effects.delay(100);
        const [sec, ms] = process.hrtime(hrstart);
        expect(ms>timeout).toBeTruthy();
        done();
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);
    });

    it('should return payload', async (done) => {
  
      const onTestAction = jest.fn(async (effects, action) => {
        const timeout = 50;
        const payload = {timeout};
        const result = await effects.delay(100, payload);
        expect(result).toBe(payload);
        done();
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);
    });

  });

  describe('all', () => {
    it('should wait both 2 action', async (done) => {
  
      const onTestAction = jest.fn(async (effects, action) => {
        setTimeout(()=>{
          effects.dispatch(testAction2);
        }, 10);
        setTimeout(()=>{
          effects.dispatch(testAction3);
        }, 20);
        const hrstart = process.hrtime();
        const actions = await effects.all([TEST_ACTION2, TEST_ACTION3]);
        const [sec, ms] = process.hrtime(hrstart);

        expect(ms>20).toBeTruthy();
        expect(actions).toEqual([testAction2, testAction3]);
        done();
      });

      function initEffects(effects) {
        effects.takeEvery(TEST_ACTION, onTestAction);      
      }
      
      const middleware = makeMiddleware(initEffects);
      await middleware(testAction);
    });

  });


});
