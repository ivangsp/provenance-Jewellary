import React, {Component} from 'react';

import  {AddArtPiece, SingleArtPiece} from './components/index';
import axios from 'axios';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: []
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

    render() {   
        return (
            <div className="main-wrapper">
                <div className="row">
                    <div className="col-md-12">
                       <AddArtPiece />
                    </div>
                </div>
                <SingleArtPiece products={this.state.products} />
            </div>
        )
    }
}

export default App;