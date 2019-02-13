import React from 'react';
import PropTypes from 'prop-types';
import { ProductItem } from './ProductItem';

export const ProductListItem = ({ products }) => {
  const prodNodes =
    products &&
    products.map(product => (
      <div className="col-4" key={product.serial_number}>
        <ProductItem product={product} />
      </div>
    ));
  return prodNodes;
};

ProductListItem.propTypes = {
  products: PropTypes.array,
};
