import React from 'react';
import { createAsset } from '../actions';

export default class ProductForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.encodeImageFileAsURL = this.encodeImageFileAsURL.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.image = '';

    this.state = {};
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  async submitForm() {
    const params = {
      $class: 'org.trade.com.ProductItem',
      serial_number: new Date().getTime().toString(),
      owner: 'resource:org.trade.com.Trader#T1',
      image: this.image,
      productInfo: {
        ...this.state,
        quantity: 1,
        $class: 'org.trade.com.Product',
      },
      date_created: '2018-12-29T17:48:10.752Z',
      location: 'Tallinn',
    };
    await createAsset(params);
  }

  encodeImageFileAsURL() {
    const file = document.getElementById('uploadImg').files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      document.getElementById('uploaded-image').src = reader.result;
      this.image = reader.result;
    };
    reader.readAsDataURL(file);
  }

  render() {
    return (
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="name">Design Name:</label>
            <input
              type="text"
              name="design"
              className="form-control"
              placeholder="Enter the design name"
              onChange={this.handleChange}
            />
          </div>
        

          <div className="form-group">
            <label htmlFor="image">Upload Product Image</label>
            <input
              type="file"
              id="uploadImg"
              className="form-control-file"
              onChange={this.encodeImageFileAsURL}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="text"
              name="price"
              className="form-control"
              placeholder="Enter product price"
              onChange={this.handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              name="location"
              className="form-control"
              placeholder="Enter Location"
              // onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="col-6">
          <img src="" id="uploaded-image" alt="" height="300px" />
        </div>

        <div className="col-12">
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="textarea"
              rows="4"
              name="description"
              className="form-control"
              placeholder="Enter product description"
              onChange={this.handleChange}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={this.submitForm}
        >
          Submit
        </button>
      </div>
    );
  }
}
