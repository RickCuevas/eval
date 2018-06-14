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
    transform             : 'translate(-50%, -50%)',
    backgroundColor       : '#ffe0cc'
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
            goals: ['','','']

        };
        this.grid = this.grid.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.sendDate = this.sendData.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.evalForm = this.evalForm.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.sendData = this.sendData.bind(this);
        this.addGoal = this.addGoal.bind(this);
    }


    openModal(employee) {

        const evaluation = axios.get(`http://localhost:3000/getEval?id=${employee.id}`).then(  (evaluation) => {



            this.setState({ modalIsOpen: true, evaluation: evaluation.data[0], evalId: evaluation.data[1]['evalId'], currentEmployee: employee.name });

          }).catch(function (error) {
            console.log(error);
          });
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

    addGoal(event){
        event.preventDefault()
        const goals = this.state.goals
        goals.push('')
        this.setState({[goals]: goals})
    }

    sendData(event){
        const payload = this.state.evaluation
        payload[goals] = this.state.goals
        event.preventDefault()
        console.log(this.state.evalId)
        axios({
          method: 'post',
          url: `http://localhost:3000/update?id=${this.state.evalId}`,
          data: payload
      }).then(  (response) => {
           console.log(response)
           this.closeModal()
       }).catch( (error) => {
            console.log(error);
      });

    }

    evalForm(){
        console.log('rerendering')
        console.log(this.state.goals)
        if (!this.state.evaluation){
            return (<p>placeHoler</p>)
        }
        else{
            const evalForm =[]
            console.log(this.state.evaluation)

            for (const id in this.state.evaluation) {

                evalForm.push((
                            <div className="box">
                                {this.state.evaluation[id].question}
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
                            <textarea name="comment" key={id} value={this.state.evaluation[id].comment} placeholder="Comments?"  onChange={(event) => this.handleChange("comment",id, event)} />
                        </div>
                ))
            }
            const times = (this.state.goals.length)
            for(let i=0; i < times; i++){
                console.log('i')
                console.log(i)
                evalForm.push((
                    <textarea className="goal" name="goal" key={i}  value={this.state.goals[i]} placeholder="Goooooooooal!"  onChange={(event) => this.handleChange("goal", i, event)} />

                ))
            }

            return evalForm

        }
    }



    handleChange(type, id, value) {
        console.log('handle id')
        console.log(id)

        const evaluation = this.state.evaluation
        const goals = this.state.goals

        if (type === "rating") {

            evaluation[id]['rating'] = value
            this.setState({[evaluation]: evaluation})
            console.log(this.state.evaluation)

        }
        else if (type === "comment") {
            evaluation[id]['comment'] = value.target.value
            this.setState({[evaluation]: evaluation})
            console.log(this.state.evaluation)

        }
        else if (type === "goal"){
            console.log('goals')
            console.log(goals)

            goals[id] = (value.target.value)
            this.setState([goals]: goals)
            // console.log('this.gols')
            // console.log(this.state.goals)

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

            <h2 className="title">Eval for {this.state.currentEmployee}</h2>
              <button className="close" onClick={this.closeModal}>🍔</button>


            <form className="frame">
                {this.evalForm()}
                <button onClick={this.addGoal}> +1 Goal!</button>
                <button onClick={this.sendData}>Submit</button>
            </form>

        </Modal>

      </div>
    );
  }
}

export default App;
