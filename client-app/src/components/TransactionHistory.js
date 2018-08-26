import React from 'react';
import PropTypes from 'prop-types';

const TransactionHistory = ({trans}) => {
    console.log('pppp', trans);
    let block = null;
    if (trans && trans.length > 0 ) {
        block =  trans.map((tran, index) => (
            <div className= "block" key = {index}>
                <p>Txid: <small className="trans-id" >{tran.txId}</small></p>
                <p>Owner: <small>{tran.value.owner.username}</small></p>
            </div> 
        ))
    }
    
    return (
       <div className="block-container">
        {block}
       </div>
    )
}
TransactionHistory.propTypes = {
    trans: PropTypes.array
}

export default TransactionHistory;
