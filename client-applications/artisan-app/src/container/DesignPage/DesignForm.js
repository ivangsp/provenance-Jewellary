import React from 'react';
import { createAsset } from '../actions';

export default class DesignForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            material: [
                {
                    $class: 'org.trade.com.BillOfMaterial',
                    material: '',
                    quntity: 0.0
                }
            ],
            specification: {
                "$class": "org.trade.com.Specification",
                color: '#00000',
                width: 0.0,
                length: 0.0,
                radius: 0.0
            }
        };
    }

    handleChange = index => e => {
        const name = e.target.name;
        const value = e.target.value;

        if (name === 'name' || name === 'description') {
            this.setState({ [name]: value });
        }

        else if (index > -1) {
            this.setState(prevstate => {
                const material = prevstate.material.map((mat, i) => {
                    if (i !== index) return mat;
                    return { ...mat, [name]: value };
                });
                return { ...prevstate, material: material }
            });
        }
        else {
            this.setState(prevState => {
                const specification = { ...prevState.specification, [name]: value }
                return { ...prevState, specification: specification }
            });

        }
    }

    submitForm = async () => {
        const params = {
            ...this.state,
            $class: 'org.trade.com.ProductDesign',
            id: new Date().getTime().toString(),
            designers: ['resource:org.trade.com.User#d1'],
            dateCreated: new Date(),
        };
        console.warn('params>>>', params);

        await createAsset(params, 'ProductDesign');
    }

    encodeImageFileAsURL = () => {
        const file = document.getElementById('uploadImg').files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            // display uploaded image
            document.getElementById('uploaded-image').src = reader.result;
            // this.setState({ 'image': reader.result });
        };
        reader.readAsDataURL(file);
    }

    addMaterial = () => {
        this.setState(prevstate => ({
            ...prevstate,
            material: prevstate.material.concat([
                {
                    $class: 'org.trade.com.BillOfMaterial',
                    material: '',
                    quantity: 0,
                },
            ]),
        }));
    };

    render() {
        return (
            <div className="container">
                {/* design name */}
                <div className="col-12">
                    <div className="form-group">
                        <label htmlFor="name">Design Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={this.state.name}
                            className="form-control"
                            placeholder="Enter the design name"
                            onChange={this.handleChange(-1)}
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
                                    <input type="color" name="color" value={this.state.specification.color} onChange={this.handleChange(-1)} />
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
                                        <input className="form-check-input" type="radio" name="shape" id="inlineCheckbox1" value="Rectangle" />
                                        <label className="form-check-label" htmlFor="inlineCheckbox1">Rectangle</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="shape" id="inlineCheckbox2" value="Square" />
                                        <label className="form-check-label" htmlFor="inlineCheckbox2">Square</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="shape" id="inlineCheckbox3" value="circle" />
                                        <label className="form-check-label" htmlFor="inlineCheckbox3">circle</label>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-3">
                                        <label htmlFor="width" >Width</label>
                                        <input type="number" className="form-control-sm" name="width" value={this.state.specification.width} onChange={this.handleChange(-1)} />
                                    </div>

                                    <div className="form-group col-md-3">
                                        <label htmlFor="height" >Height</label>
                                        <input type="number" className="form-control-sm" name="length" value={this.state.specification.length} onChange={this.handleChange(-1)} />
                                    </div>

                                    <div className="form-group col-md-3">
                                        <label htmlFor="radius">Radius</label>
                                        <input type="number" className="form-control-sm" name="radius" value={this.state.specification.radius} onChange={this.handleChange(-1)} />
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
                                    <textarea rows="4" value={this.state.description} name="description" className="form-control" />
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
                                <input type="file" id="uploadImg" className="form-control-file" onChange={this.encodeImageFileAsURL} />
                                <img src="" id="uploaded-image" alt="" height="300px" />
                            </div>
                        </div>
                    </div>

                    {/* design materials */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#materials" aria-expanded="false" aria-controls="design-image">
                                    Material
                        </button>
                            </h5>
                        </div>
                        <div id="materials" className="collapse " data-parent="#accordion">
                            <div className="card-body">
                                <div className="materials">

                                    {this.state.material.map((mat, i) => (

                                        <div className="form-row" key={i}>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="material-name" >Material</label>
                                                <input type="text" value={mat.material} className="form-control-sm" name="material" onChange={this.handleChange(i)} />
                                            </div>

                                            <div className="form-group col-md-3">
                                                <label htmlFor="quantity" >Quantity</label>
                                                <input type="number" value={mat.quntity} className="form-control-sm" name="quntity" onChange={this.handleChange(i)} />
                                            </div>

                                        </div>
                                    ))}
                                    <div className="col-md-3 col-md-offset-6">
                                        <button className="btn btn-primary" onClick={this.addMaterial}>Add</button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="col-12 mt-2">
                    <button type="button" className="btn btn-primary" onClick={this.submitForm}>Submit</button>
                </div>
            </div>
        );
    }
}
