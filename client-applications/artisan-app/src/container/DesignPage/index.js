import React, {Component} from 'react';
import DesignForm from './DesignForm';

class DesignPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            designId: ''
        }   
    }
    componentDidMount(){
        const { id } = this.props.match.params;
        this.setState({
            designId: id
        });
    }
    render(){
        return(
            <div>
                {this.state.designId === 'new' ? <DesignForm /> : null }
            </div>
        )
    }
}
export default DesignPage;