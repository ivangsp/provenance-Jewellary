import React, { Component } from 'react';
import utils from '../utils/state';
import PropTypes from 'prop-types';

class AddArtPiece extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showLoader: false,
			error: ''
		};
	}

	onChange =(e) => {
		this.setState({
			[e.target.name]: e.target.value
		})
	}
	fileUploadHandler = (event) => {
		this.setState({
			image: event.target.files[0]
		});
	}

	submit = () => {
		this.setState({
			showLoader: true
		});
		// const fd = new FormData();
		// fd.append('image', this.state.image, this.state.image.name);
		// const params = this.state;
		// params.image = fd;

		utils.recordTransaction(this.state)
			.then(transId => {
				this.setState({
					showLoader: false
				})
				this.props.onSubmitTransaction(transId);
			})
			.catch(error => {
				console.log('erroro', error);
				this.setState({
					error: error,
					showLoader: false
				});
			})
	}

    render() {
        return (
            <div className="add-form">
				<div className="form-group row">
					<label htmlFor="serialNumber" className="col-sm-2 col-form-label">serialNumber</label>
					<div className="col-sm-10">
						<input 
							type="text"  className="form-control" onChange={ this.onChange }
							id="serialNumber" required name="serialNumber" 
						/>
					</div>
				</div>

				<div className="form-group row">
					<label htmlFor="name" className="col-sm-2 col-form-label">Product Name</label>
					<div className="col-sm-10">
						<input 
							type="text" className="form-control"  onChange={ this.onChange }
							id="name" required  name="name"
						/>
					</div>
				</div>

				<div className="form-group row">
					<label htmlFor="holderName" className="col-sm-2 col-form-label">ID of Owner</label>
					<div className="col-sm-3">
						<input
							type="text" className="form-control" onChange={ this.onChange }
							id="holderName" required name="ownerId" 
						/>
					</div>
				</div>

				<div className="form-group row">
					<label htmlFor="holderName" className="col-sm-2 col-form-label">Name of artisan</label>
					<div className="col-sm-10">
						<input
							type="text" className="form-control" onChange={ this.onChange }
							id="holderName" required name="owner" 
						/>
					</div>
				</div>

				<div className="form-group row">
					<label htmlFor="address" className="col-sm-2 col-form-label">Address:</label>
					<div className="col-sm-10">
						<input 
							type="text" className="form-control" name="company"
							id="address" required onChange={ this.onChange }
						/>
					</div>
				</div>
				<div className="form-group row">
					<label htmlFor="company" className="col-sm-2 col-form-label">Company:</label>
					<div className="col-sm-10">
						<input 
							type="text" className="form-control" name="company"
							id="company" required onChange={ this.onChange }
						/>
					</div>
				</div>
				<div className="custom-file">
					<input type="file" className="custom-file-input" name="file" 
						id="file" required onChange={ this.fileUploadHandler } 
					/>
  				</div>

				<div className="form-group row">
					<button 
						className="col-md-3 btn btn-success" onClick={() => this.submit()}>
						Add to Block chain
					</button>
				</div>
				{ this.state.showLoader && <div className="text-center  loader"></div> }
				{ this.state.error && <div className="text-center error-msg">{ this.state.error }</div>}
    		</div>						
        )
    }
}
AddArtPiece.propTypes = {
	onSubmitTransaction: PropTypes.func.isRequired
}

export default AddArtPiece;