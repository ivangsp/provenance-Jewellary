import React, {Component} from 'react';

import jw1 from './static/img/jw1.jpg';
import jw2 from './static/img/jw2.jpeg';

class App extends Component {

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-4">
                        <button className="btn btn-success">Add Art Piece </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="main-container">
                            <div className="img-container">
                                <img src={jw1} height="50px" />
                            </div>
                            <div className="text-container">
                                <button className="btn btn-secondary"> Transfer Ownership</button>
                                <button className="btn btn-primary">Edit</button>
                                <button className="btn btn-primary"> Transfer Ownership</button>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        )
    }
}

export default App;