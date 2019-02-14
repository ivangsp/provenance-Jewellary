import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

import createRootReducer from './reducers'
// import saga from './sagas/index';

export const history = createBrowserHistory();
const composeStoreEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

  const middleWares =
  process.env.NODE_ENV === 'development'
    ? [sagaMiddleware, createLogger()]
    : [sagaMiddleware];

export default function configureStore(preloadedState) {
  const store = createStore(
    createRootReducer(history), // root reducer with router state
    preloadedState,
    composeStoreEnhancers(
      applyMiddleware(
        ...middleWares,
        routerMiddleware(history), // for dispatching history actions
      ),
    ),
  )

  // sagaMiddleware.run(saga);

  return store
}
