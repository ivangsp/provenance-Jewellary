import React from 'react';
import { createAsset, fetchAssets } from '../actions';


export default class ProductForm extends React.Component {
  constructor(props) {
    super(props);
    this.designs = [];

    this.state = {
      name: '',
      price: 0.0,
      location: '',
      design: ''
    };
  }

  async componentDidMount () {
    try {
      const designs = await fetchAssets('ProductDesign');
      if (designs) {
        this.designs = designs.data;
      }
    }
    catch (e) {
      console.warn(e);
    }
  }

  handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value,
    });
  }

  submitForm = async() => {
    const params = {
      ...this.state,
      $class: 'org.trade.com.Product',
      serial_number: new Date().getTime().toString(),
      owner: 'resource:org.trade.com.User#artisan1',
      design: 'resource:org.trade.com.ProductDesign#'+this.state.design,
      dateCreated: new Date (),
    };
    await createAsset(params, 'Product');
  }

  encodeImageFileAsURL = () => {
    const file = document.getElementById('uploadImg').files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      document.getElementById('uploaded-image').src = reader.result;
      this.setState({image: reader.result});
    };
    reader.readAsDataURL(file);
  }

  render() {
    const designs = this.designs.map((design, index) => (
      <option value={design.id} key={index}>{design.name}</option>
    ));

    return (
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="name">Product Name:</label>
            <input
              type="text"
              name="name"
              value={this.state.name}
              className="form-control"
              placeholder="Enter  product name"
              onChange={this.handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="design">Select Design</label>
            <select name="design" className="form-control" id="design" onChange={this.handleChange} >
              <option>Select the design</option>
              {designs}
            </select>
            
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
              value={this.state.price}
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
              value={this.state.location}
              className="form-control"
              placeholder="Enter Location"
              onChange={this.handleChange}
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
              // onChange={this.handleChange}
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
