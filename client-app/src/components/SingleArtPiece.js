import React from 'react';
import PropTypes from 'prop-types';

import jw1 from '../static/img/jw1.jpg';

const SingleArtPiece = ({products}) => {
    const prodNode = products.map((prod, index) => {
        return (
            <div className ="row"  key={index} >
            <div className="col-md-12">
                <div className="main-container">
                    <div className="img-container">
                        <img src={jw1} height="100px"  alt="" />
                    </div>
    
                    <div className="text-container">
                        <p><b>ID:</b> '#000{prod.Key}</p>
                        <p><b>Name:</b> {prod.Record.holder}</p>
                        <p><b>Date created:</b> 23.08.2008</p>
                        <p><b>Location:</b> {prod.Record.location}</p>
                    </div>
                    <div className="btn-container">
                        <button className="btn btn-secondary"> Transfer Ownership</button>
                        <button className="btn btn-primary mt-2">Edit</button>
                        <button className="btn btn-danger mt-2"> Transfer Ownership</button>
                    </div>
                </div>
            </div>
        </div>
        );
    }
    );

    return prodNode;

}

SingleArtPiece.propTypes = {
    products: PropTypes.array.isRequired
}

export default SingleArtPiece;