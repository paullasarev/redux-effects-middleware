
export function createMiddleware (options = {}) {

  return ({ dispatch, getState }) => (next) => (action) => {


    return next(action);
  };
}


