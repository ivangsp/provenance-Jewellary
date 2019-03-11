import React from 'react';
import PropTypes from 'prop-types';

export const ProductItem = ({ product }) => (
  <div className="card" style={{ width: '18rem' }}>
    <img src={product.image} className="card-img-top" alt="" />
    <div className="card-body">
      <h5 className="card-title">{product.name}</h5>
      {/* <p className="card-text">{product.productInfo.description}</p> */}
    </div>
    <ul className="list-group list-group-flush">
      <li className="list-group-item">
        <b>Serial number: </b>
        {product.serial_number}
      </li>
      <li className="list-group-item">
        <b>price: </b>
        {product.price}
      </li>
      <li className="list-group-item">{product.dateCreated}</li>
    </ul>
  </div>
);

ProductItem.propTypes = {
  product: PropTypes.object,
};
