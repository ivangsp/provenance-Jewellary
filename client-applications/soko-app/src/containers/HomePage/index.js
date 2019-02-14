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
