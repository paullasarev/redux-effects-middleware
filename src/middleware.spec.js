import { omit } from 'lodash';

import {
  createMiddleware,
} from './index';

describe('middleware', ()=>{
  let lastActions;
  const dispatch = jest.fn((action) => {
    lastActions.push(action);
  });
  let storeState = {};
  const getState = jest.fn(() => {
    return storeState;
  });
  const store =  {
    dispatch,
    getState,
  };
  const testAction = {
    type: 'TEST_ACTION',
  };

  const next = jest.fn((action) => {
  });

  beforeEach(() => {
    jest.clearAllMocks();
    lastActions = [];
    storeState = {};
  });

  it('should call next middleware', async () => {
    const middleware = createMiddleware();
    await middleware(store)(next)(testAction);

    expect(next).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });


});
