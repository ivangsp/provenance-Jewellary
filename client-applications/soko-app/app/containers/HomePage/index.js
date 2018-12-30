/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import PurchaseOrderForm from './PurchaseOrderForm';

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  render() {
    return (
      <div className="container">
        <div className="row">
          <h2>Soko App</h2>
        </div>
        <div className="row">
          <PurchaseOrderForm />
        </div>
      </div>
    );
  }
}
