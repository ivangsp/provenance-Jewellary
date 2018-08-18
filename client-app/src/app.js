import React, {Component} from 'react';

import  {AddArtPiece, SingleArtPiece} from './components/index';
import axios from 'axios';
import utils from './utils/state';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            transId: ''
        };
    }

    componentDidMount() {
        axios.get('http://localhost:8000/get_all_products')
        .then(response => {
            this.setState({
                products: response.data
            });
            console.log('>>>', response.data);
        })
        .catch(error => {
            console.log('error>>', error);
        });
    }

    onSubmitTransaction(id) {
        this.setState({transId: id})
    }

    render() {   
        return (
            <div className="main-wrapper">
                <div className="row">
                    <div className="col-md-12">
                       <AddArtPiece onSubmitTransaction={(id) => this.onSubmitTransaction(id)} />
                    </div>
                </div>
                <div className="row"> 
                    {
                        this.state.transId && <p className="text-center show-transId"> {this.state.transId} </p>
                    }
                </div>
                <SingleArtPiece products={this.state.products} />
            </div>
        )
    }
}

export default App;