import React from 'react';

import jw1 from '../static/img/jw1.jpg';

const SingleArtPiece = () => {
    return (
        <div className="col-md-12">
        <div className="main-container">
            <div className="img-container">
                <img src={jw1} height="100px" />
            </div>

            <div className="text-container">
                <p><b>ID:</b> '#7888njk</p>
                <p><b>Name:</b> Ojiambo Ivan</p>
                <p><b>Date created:</b> 23.08.2008</p>
                <p><b>Location:</b> Raatuse 22 Tartu</p>
            </div>
            <div className="btn-container">
                <button className="btn btn-secondary"> Transfer Ownership</button>
                <button className="btn btn-primary mt-2">Edit</button>
                <button className="btn btn-danger mt-2"> Transfer Ownership</button>
            </div>
        </div>
    </div>
    )
}

export default SingleArtPiece;