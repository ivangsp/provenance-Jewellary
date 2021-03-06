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
import { fetchAssets } from '../actions';
import { ProductListItem } from './ProductList';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
    };
  }

  async componentDidMount() {
    try {
      const products = await fetchAssets('Product');
      this.setState({
        products: products.data,
      });
    } catch (e) {
      console.log('ERROR>>', e);
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <ProductForm />
        </div>
        <div className="row">
          <ProductListItem products={this.state.products} />
        </div>
      </div>
    );
  }
}
