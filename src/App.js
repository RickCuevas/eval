import React, { Component } from 'react';
import ReactStars from 'react-stars'
import upm from './upm.png';
import './App.css';
import axios from 'axios';
import Modal from 'react-modal';
import queryString from 'query-string';

const params = queryString.parse(window.location.search);


Object.assign(axios.defaults.headers.post, {
  "Accept": "application/json",
  "Content-Type": "application/json"
});

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'

  }
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
// Modal.setAppElement('#yourAppElement')

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false,
            employees: [],
            evaluation: null,
            currentEmployee:'',

        };
        this.grid = this.grid.bind(this);
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.sendDate = this.sendData.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.evalForm = this.evalForm.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.sendData = this.sendData.bind(this);
    }


    openModal(employee) {

        const evaluation = axios.get(`http://localhost:3000/getEval?id=${employee.id}`).then(  (evaluation) => {



            this.setState({ modalIsOpen: true, evaluation: evaluation.data[0], evalId: evaluation.data[1]['evalId'], currentEmployee: employee.name });

          }).catch(function (error) {
            console.log(error);
          });
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

    grid(){

        const gridItems =  []
        this.state.employees.forEach( (employee)=>{

            gridItems.push((<div onClick={() =>this.openModal(employee)}  className="grid-item">{employee.name}</div>))
        });

        return(
        <div className="grid-container">
            {gridItems}
         </div>)
    }

    sendData(event){
        event.preventDefault()
        console.log(this.state.evalId)
        axios({
          method: 'post',
          url: `http://localhost:3000/update?id=${this.state.evalId}`,
          data: this.state.evaluation
      });

    }

    evalForm(){
        if (!this.state.evaluation){
            return (<p>placeHoler</p>)
        }
        else{
            const evalForm =[]
            console.log(this.state.evaluation)

            for (const id in this.state.evaluation) {



                evalForm.push((

                    <label className="scroll">
                        <label>
                            {this.state.evaluation[id].question}
                        </label>
                        <div className="rating-wrap">
                            <ReactStars
                            key={id}
                            name="rating"
                            count={5}
                            value={this.state.evaluation[id].rating || 0}
                            onChange={(event) => this.handleChange("rating", id, event)}
                            size={30}
                            color2={'#ffd700'} />
                        </div>
                        <label>
                             <textarea name="comment" key={id} value={this.state.evaluation[id].comment} placeholder="Comments?"  onChange={(event) => this.handleChange("comment",id, event)} />
                        </label>

                        {/*<label>
                            <select type="text"  value={this.state.value} key={key} name="name" onChange={this.handleChange} >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </label> */}
                    </label>

                ))
            }
            return evalForm

        }
    }



    handleChange(type, id, value) {
        console.log('type', type)
        console.log( 'id',id)
        console.log('value', value)

        const evaluation = this.state.evaluation

        if (type === "rating") {

            evaluation[id]['rating'] = value
            this.setState({[evaluation]: evaluation})
            console.log(this.state.evaluation)

        }
        else {
            evaluation[id]['comment'] = value.target.value
            this.setState({[evaluation]: evaluation})
            console.log(this.state.evaluation)

        }




    }

    componentDidMount(event){

        const {propertyCode} = params




      axios.get(`http://localhost:3000/getEmps?propertyCode=${propertyCode}`)
        .then( (response) => {

          this.setState({employees: response.data})
        })
        .catch(function (error) {
          console.log(error);
        });

    }



  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={upm} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {this.grid()}

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
            <h2 ref={subtitle => this.subtitle = subtitle}>Eval for {this.state.currentEmployee}</h2>
              <button onClick={this.closeModal}>close</button>


            <form className="frame">
                {this.evalForm()}
                <button onClick={this.sendData}>Submit</button>
            </form>

        </Modal>

      </div>
    );
  }
}

export default App;
