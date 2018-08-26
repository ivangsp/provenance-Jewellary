import React, {
	Component
} from 'react';
import PropTypes from 'prop-types';
import utils from '../utils/state';

class TransferOwnerShip extends Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	}
	onChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		})
	}

	onSubmit = () => {
		utils.changeOwner(this.state)
		.then (res => {
			console.log('>>>res', res);
			this.props.transferOwnership(res);
		})
		.catch(err => console.log('error>>', err));
	}


	render() {
		return (
			<div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" 
				aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLongTitle">Modal title</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<div className="form-group row">
								<label htmlFor="serialNumber" className="col-sm-2 col-form-label">serialNumber</label>
								<div className="col-sm-10">
									<input 
										type="text"  className="form-control" onChange={ this.onChange }
										id="serialNumber" required name="key" 
									/>
								</div>
							</div>

							<div className="form-group row">
								<label htmlFor="holderName" className="col-sm-2 col-form-label">ID of current Owner</label>
								<div className="col-sm-3">
									<input
										type="text" className="form-control" onChange={ this.onChange }
										id="holderName" required name="prevOwnerId" 
									/>
								</div>
							</div>

							<div className="form-group row">
								<label htmlFor="holderName" className="col-sm-2 col-form-label">Name of artisan</label>
								<div className="col-sm-10">
									<input
										type="text" className="form-control" onChange={ this.onChange }
										id="holderName" required name="prevOwnerUsername" 
									/>
								</div>
							</div>
							
							<div className="col-md-12">
								<h4 className="text-center">Transfer TO</h4>
							</div>

							<div className="form-group row">
								<label htmlFor="address" className="col-sm-2 col-form-label">ID:</label>
								<div className="col-sm-10">
									<input 
										type="text" className="form-control" required name="newOwnerId"
										onChange={ this.onChange }
									/>
								</div>
							</div>

							<div className="form-group row">
								<label  className="col-sm-2 col-form-label">UserName:</label>
								<div className="col-sm-10">
									<input 
										type="text" className="form-control" required name="newOwnerUsername"
										onChange={this.onChange }
									/>
								</div>
							</div>

							<div className="form-group row">
								<label  className="col-sm-2 col-form-label">company:</label>
								<div className="col-sm-10">
									<input 
										type="text" className="form-control" required name="newOwnerCompany"
										onChange={ this.onChange }
									/>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
							<button type="button" className="btn btn-primary" data-dismiss="modal"
								onClick = { this.onSubmit }>Confirm
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
TransferOwnerShip.propTypes = {
	transferOwnership: PropTypes.func
}
export default TransferOwnerShip;