import React from 'react';

export default class DesignForm extends React.Component {
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
    // await createAsset(params);
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
      <div className="container">
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
        </div>

        <div id="accordion">
            <div className="card">
                <div className="card-header" id="headingOne">
                <h5 className="mb-0">
                    <button className="btn btn-link" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    select color
                    </button>
                </h5>
                </div>

                <div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-parent="#accordion">
                <div className="card-body">
                    <div className="form-group">
                        <label htmlFor="color">Select Color</label>
                        <input type="color" value="#ff0000" onChange={this.handleChange}/>
                    </div>
                </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header" id="headingTwo">
                    <h5 className="mb-0">
                        <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Dimension
                        </button>
                    </h5>
                </div>
                <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
                    <div className="card-body">
                        <div className="col-12">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" id="inlineCheckbox1" value="option1" onChange={this.handleChange} />
                                <label className="form-check-label" htmlFor="inlineCheckbox1">Rectangle</label>
                                </div>
                                <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" id="inlineCheckbox2" value="option2" onChange={this.handleChange}/>
                                <label className="form-check-label" htmlFor="inlineCheckbox2">Square</label>
                                </div>
                                <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" id="inlineCheckbox3" value="option3" onChange={this.handleChange} />
                                <label className="form-check-label" htmlFor="inlineCheckbox3">circle</label>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-3">
                                <label htmlFor="width" >Width</label>
                                <input type="number" className="form-control-sm" name="width" />
                            </div>

                            <div className="form-group col-md-3">
                                <label htmlFor="height" >Height</label>
                                <input type="number" className="form-control-sm" name="height" />
                            </div>

                            <div className="form-group col-md-3">
                                <label htmlFor="radius">Radius</label>
                                <input type="number" className="form-control-sm" name="radius" />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header" id="description">
                    <h5 className="mb-0">
                        <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#description-body" aria-expanded="false" aria-controls="description-body">
                            Enter a short description about the design
                        </button>
                    </h5>
                </div>
                <div id="description-body" className="collapse" aria-labelledby="description" data-parent="#accordion">
                    <div className="card-body">
                        <div className="form-group">
                            <textarea rows="4"  value={this.state.description} name="description" className="form-control" onChange={this.handleChange}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header" id="image">
                    <h5 className="mb-0">
                        <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#design-image" aria-expanded="false" aria-controls="design-image">
                            Add a design photo
                        </button>
                    </h5>
                </div>
                <div id="design-image" className="collapse " aria-labelledby="image" data-parent="#accordion">
                    <div className="card-body">
                    <input type="file" id="uploadImg" className="form-control-file" onChange={this.encodeImageFileAsURL}/>
                    <img src="" id="uploaded-image" alt="" height="300px" />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-12">    
            <button type="button" className="btn btn-primary" onClick={this.submitForm}>Submit</button>
        </div>
      </div>
    );
  }
}
