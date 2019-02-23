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
                <span className="line">
                    
                </span>
                <span>
                    <img src={diamond} alt="" width="20px" height="30px" />
                </span>
                <span className="line"></span>
            </div>
            <div className="right">
                <div className="content">
                    <div className="cont-header">
                        <span>Designer(s)</span>
                        <span className="">Details(s)</span>
                    </div>
                    <div className="main-content">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor bru
                    </div>
                </div>
            </div>
        </div>
    )
}