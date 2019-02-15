import React, {Component} from 'react';

class SearchForm extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return(
            <div className="form-group">
                <label htmlFor="search">Determine the provenance of Jewelery</label>
                <input type="text" className="form-control" name="search" placeholder="Enter Serial number" />
            </div>
        )
    }
}

export default SearchForm;
