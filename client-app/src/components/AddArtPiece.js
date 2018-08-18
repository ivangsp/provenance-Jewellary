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

	onChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	submit() {
		this.setState({
			showLoader: true
		});
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
							type="text" className="form-control" name="location"
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
				{ this.state.showLoader && <div className="text-center  loader"></div> }
				{ this.state.error && <div className="text-center error-msg">{this.state.error}</div>}
    		</div>						
        )
    }
}
AddArtPiece.propTypes = {
	onSubmitTransaction: PropTypes.func.isRequired
}

export default AddArtPiece;