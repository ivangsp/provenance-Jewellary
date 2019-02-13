import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import NavBar from './components/NavBar';
import HomePage from './container/HomePage';



const App = ({ history }) => {
  return (
    <ConnectedRouter history={history}>
      <div>
        <NavBar />
        <Route path="/" exact component={HomePage} />
      </div>
    </ConnectedRouter>
  );
};

App.propTypes = {
  history: PropTypes.object.isRequired
};
export default App;
