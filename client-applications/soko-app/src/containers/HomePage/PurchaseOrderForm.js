import React from 'react';
import { createPurchaseOrder } from './actions';

export default class PurchaseOrderForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [
        {
          $class: 'org.trade.com.Product',
          name: '',
          description: '',
          quantity: 1,
          price: 0.0,
        },
      ],
      total_Amount: 0.0,
    };
  }

  handleAddProduct = () => {
    this.setState(prevstate => ({
      ...prevstate,
      products: prevstate.products.concat([
        {
          $class: 'org.trade.com.Product',
          name: '',
          description: '',
          quantity: '',
          price: '',
        },
      ]),
    }));
  };

  handleProductChange = index => evt => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const products = this.state.products.map((prod, i) => {
      if (i !== index) return prod;
      return { ...prod, [evt.target.name]: evt.target.value };
    });

    this.setState({ products });

    if (evt.target.name === 'price' || evt.target.name === 'quantity') {
      this.computeTotalAmount();
    }
  };

  handleSubmit = async () => {
    const params = {
      ...this.state,
      id: new Date().getTime(),
      $class: 'org.trade.com.CreatePurchaseOrder',
      buyer: 'resource:org.trade.com.Trader#3152',
      seller: 'resource:org.trade.com.Trader#9448',
    };
    await createPurchaseOrder(params);
    console.log('params>>', params);
  };

  computeTotalAmount() {
    this.setState(prevState => {
      const totalAmount = prevState.products.reduce(
        (acc, prod) => acc + prod.price * prod.quantity,
        0,
      );
      return { ...prevState, total_Amount: totalAmount };
    });
  }

  render() {
    return (
      <div className="col-12">
        <div className="row justify-content-end">
          <div className="col-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleAddProduct}
            >
              Add Product
            </button>
          </div>

          <div className="col-2">
            <button
              type="button"
              className="btn btn-success"
              onClick={this.handleSubmit}
            >
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

        {this.state.products.map((product, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className="row" key={i}>
            <div className="form-group col-6">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                name="name"
                value={product.name}
                className="form-control"
                placeholder="Enter product Name"
                onChange={this.handleProductChange(i)}
              />
            </div>
            <div className="form-group col-2">
              <label htmlFor="price">price</label>
              <input
                type="text"
                name="price"
                className="form-control"
                onChange={this.handleProductChange(i)}
                value={product.price}
              />
            </div>

            <div className="form-group col-2">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="text"
                name="quantity"
                className="form-control"
                onChange={this.handleProductChange(i)}
                value={product.quantity}
              />
            </div>

            <div className="form-group col-10">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                onChange={this.handleProductChange(i)}
                value={product.description}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
}
