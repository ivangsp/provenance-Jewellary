import React from 'react';
import * as serviceWorker from './serviceWorker';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore, {history} from './configureStore'
import './index.css';
import App from './App';


const store = configureStore(/* provide initial state if any */)

ReactDOM.render(
  <Provider store={store}>
      <App history={history} />
  </Provider>,
  document.getElementById('root')
)

serviceWorker.unregister();