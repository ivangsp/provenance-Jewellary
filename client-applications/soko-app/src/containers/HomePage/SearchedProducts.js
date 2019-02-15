import React from 'react';
import './style.css';
import product from './ring.jpeg';
import diamond from './diamond.png';

export default function () {
    return (
        <div className="searched-result-container">
            <div className="left">
                <img src={product} alt=""  width="280" height="auto"/>
            </div>
            <div className="center">
                <span>
                    <img src={diamond} alt="" width="20px" height="30px" />
                </span>
                <span class="line">
                    
                </span>
                <span>
                    <img src={diamond} alt="" width="20px" height="30px" />
                </span>
                <span class="line">
                    
                </span>
            </div>
            <div className="right"></div>
        </div>
    )
}