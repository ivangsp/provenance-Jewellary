import React, { Component } from 'react';

class AddArtPiece extends Component {
	constructor(props) {
		super(props);
		this.state = {
			holder: '',
			address: '',
			file: '',
			serialNumber: ''	
		};
	}

    render() {
        return (
            <div className="add-form">
				<div className="form-group row">
					<label for="serialNumber" className="col-sm-2 col-form-label">serialNumber</label>
					<div class="col-sm-10">
						<input type="text"  className="form-control" id="serialNumber" required />
					</div>
				</div>
				<div class="form-group row">
					<label for="holderName" className="col-sm-2 col-form-label">Name of artisan</label>
					<div class="col-sm-10">
						<input type="text" className="form-control" id="holderName" required />
					</div>
				</div>
				<div class="form-group row">
					<label for="address" className="col-sm-2 col-form-label">Address:</label>
					<div class="col-sm-10">
						<input type="text" className="form-control" id="address" required  />
					</div>
				</div>
				<div class="custom-file">
    				<input type="file" className="custom-file-input" id="file" required />
  				</div>

				<div className="form-group row">
					<button className="col-md-3 btn btn-success">Add to Block chain</button>
				</div>
    		</div						>
        )
    }
}

export default AddArtPiece;