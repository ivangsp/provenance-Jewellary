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
import ProductForm from './ProductForm';

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center">Artisan Application</h1>
            <h3> create product</h3>
          </div>
        </div>
        <div className="row">
          <ProductForm />
        </div>
      </div>
    );
  }
}
