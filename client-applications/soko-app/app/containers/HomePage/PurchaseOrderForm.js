import React from 'react';

export default class PurchaseOrderForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: 1,
    };

    this.addProduct = this.addProduct.bind(this);
  }

  addProduct() {
    this.setState(prevstate => ({ items: prevstate.items + 1 }));
  }

  render() {
    return (
      <div className="col-12">
        <div className="row justify-content-end">
          <div className="col-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.addProduct}
            >
              Add Product
            </button>
          </div>

          <div className="col-2">
            <button type="button" className="btn btn-success">
              Submit
            </button>
          </div>
        </div>

        <hr />

        <div className="form-group col-6">
          <label htmlFor="sellerEmail">Seller Email:</label>
          <input
            type="text"
            name="sellerEmail"
            className="form-control"
            placeholder="Enter Seller's Email"
          />
        </div>

        <div className="col-12">
          <h3>Products</h3>
        </div>

        {[...Array(this.state.items)].map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <ProductDetails key={i} />
        ))}
      </div>
    );
  }
}

const ProductDetails = () => (
  <div className="row">
    <div className="form-group col-6">
      <label htmlFor="name">Product Name</label>
      <input
        type="text"
        name="name"
        className="form-control"
        placeholder="Enter product Name"
      />
    </div>

    <div className="form-group col-2">
      <label htmlFor="price">price</label>
      <input type="number" name="" className="form-control" />
    </div>

    <div className="form-group col-2">
      <label htmlFor="quantity">Quantity:</label>
      <input type="text" name="quantity" className="form-control" />
    </div>

    <div className="form-group col-10">
      <label htmlFor="description">Description</label>
      <textarea name="description" className="form-control" rows="4" />
    </div>
  </div>
);
