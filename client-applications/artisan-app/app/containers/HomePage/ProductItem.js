import React from 'react';
import PropTypes from 'prop-types';

export const ProductItem = ({ product }) => (
  <div className="card" style={{ width: '18rem' }}>
    <img src={product.image} className="card-img-top" alt="" />
    <div className="card-body">
      <h5 className="card-title">{product.productInfo.name}</h5>
      <p className="card-text">{product.productInfo.description}</p>
    </div>
    <ul className="list-group list-group-flush">
      <li className="list-group-item">{product.serial_number}</li>
      <li className="list-group-item">{product.productInfo.price}</li>
      <li className="list-group-item">{product.productInfo.date_created}</li>
    </ul>
  </div>
);

ProductItem.propTypes = {
  product: PropTypes.object,
};
