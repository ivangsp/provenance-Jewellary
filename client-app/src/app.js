import React, {Component} from 'react';

import  {AddArtPiece, SingleArtPiece} from './components/index'

class App extends Component {

    render() {
        return (
            <div className="main-wrapper">
                <div className="row">
                    <div className="col-md-12">
                       <AddArtPiece />
                    </div>
                </div>

                <div className="row">
                   <SingleArtPiece />
                </div>
            
            </div>
        )
    }
}

export default App;