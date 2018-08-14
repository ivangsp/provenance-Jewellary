import React, { Component } from 'react';
import axios from 'axios';

class AddArtPiece extends Component {
	constructor(props) {
		super(props);
		this.state = {
			holder: '',
			location: '',
			file: '',
			name:'',
			serialNumber: ''	
		};
	}

	onChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	submit() {
		// submit the form 
		console.log('form-data', this.state);
		axios.post('http://localhost:8000/add_product/', this.state)
		.then(response => {
			console.log('>>>>', response.data);
		})
		.catch(error => {
			console.log('>>>>', error);
		})
	}

    render() {
        return (
            <div className="add-form">
				<div className="form-group row">
					<label htmlFor="serialNumber" className="col-sm-2 col-form-label">serialNumber</label>
					<div className="col-sm-10">
						<input 
							type="text"  className="form-control" onChange={(e) => this.onChange(e) }
							id="serialNumber" required name="serialNumber" 
						/>
					</div>
				</div>

				<div className="form-group row">
					<label htmlFor="name" className="col-sm-2 col-form-label">Product Name</label>
					<div className="col-sm-10">
						<input 
							type="text" className="form-control"  onChange={(e) => this.onChange(e) }
							id="name" required  name="name"
						/>
					</div>
				</div>

				<div className="form-group row">
					<label htmlFor="holderName" className="col-sm-2 col-form-label">Name of artisan</label>
					<div className="col-sm-10">
						<input
							type="text" className="form-control" onChange={(e) => this.onChange(e) }
							id="holderName" required name="holder" 
						/>
					</div>
				</div>
				<div className="form-group row">
					<label htmlFor="address" className="col-sm-2 col-form-label">Address:</label>
					<div className="col-sm-10">
						<input 
							type="text" className="form-control" name="address"
							id="address" required onChange={(e) => this.onChange(e) }
						/>
					</div>
				</div>
				<div className="custom-file">
					<input type="file" className="custom-file-input" name="file" 
						id="file" required onChange={(e) => this.onChange(e) } 
					/>
  				</div>

				<div className="form-group row">
					<button 
						className="col-md-3 btn btn-success" onClick={() => this.submit()}>
						Add to Block chain
					</button>
				</div>
    		</div>						
        )
    }
}

export default AddArtPiece;