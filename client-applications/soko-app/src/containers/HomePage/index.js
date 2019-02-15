import React from 'react';
// import PurchaseOrderForm from './PurchaseOrderForm';
import SearchedProducts from './SearchedProducts';
import SearchForm from './SearchForm';

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  render() {
    return (
      <div className="container">
        <SearchForm />
        <SearchedProducts />
      </div>
    );
  }
}
