import React, {Component} from 'react';
import PropTypes from 'prop-types';
import utils from '../utils/state';

import jw1 from '../static/img/jw1.jpg';
import moment from 'moment';

class SingleArtPiece extends Component  {
    constructor(props) {
        super(props);
        this.state = {
            transactionHistory: []
        }
    }
    getBlocks(id) {
        utils.transactionHistory(id)
        .then(res => {
            this.props.transactionHistory(res);
            this.setState({
                transactionHistory: res
            })
        })
        .catch(error => {
            console.log('error occured', error);
        })
    }

    render () {
        const prodNode = this.props.products.map((prod, index) => {
            return (
                <div className ="row"  key={index} >
                    <div className="col-md-12">
                        <div className="main-container">
                            <div className="img-container">
                                <img src={jw1} height="100px"  alt="" />
                            </div>
            
                            <div className="text-container">
                                <p><b>ID:</b> '#000{prod.Key}</p>
                                <p><b>Name:</b> {prod.Record.owner.username}</p>
                                <p><b>Date created:</b> {moment(prod.Record.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</p>
                                <p><b>Company:</b> {prod.Record.owner.company}</p>
                            </div>
                            <div className="btn-container">
                                <button className="btn btn-secondary" 
                                    onClick={() => this.getBlocks(prod.Key)}>
                                    Transaction History
                                </button>
                                <button className="btn btn-primary mt-2">Edit</button>
                                <button className="btn btn-danger mt-2" 
                                    data-toggle="modal" data-target="#exampleModalCenter">
                                    Transfer Ownership 
                                </button>
                            </div>
                        </div>
                    </div> 
                    
                </div>
            );
        });

        return prodNode;
       
    }
}

SingleArtPiece.propTypes = {
    products: PropTypes.array.isRequired,
    transactionHistory: PropTypes.func
}

export default SingleArtPiece;