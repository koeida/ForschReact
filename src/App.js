import $ from "jquery";
import "./App.css";
import React from "react";

const DEFAULT_ENVIRONMENT = {
  DataStack: [],
  WordDict: [],
  Input: [],
  InputIndex: 0,
  mode: "Execute",
  CurWordDef: [],
  CurWord: '',
};

const STEPPER_URL = "http://localhost:3000/step";

function Word(props) {
  return (<div key={props.i} className="word ms-2">{props.wordString}</div>);
}

function Stepper(props) {
  const words = props.curLine.map((w,i) => <Word key={i} wordString={w} />);

  return (
    <div id="stepper" className="d-flex flex-row">
      <button id="step-back" className="btn btn-primary">
        <i className="fas fa-chevron-left"></i>
      </button>
      <div id="current-line" className="flex-grow-1 bg-dark form-control">
        <div id="code" className="text-white align-middle mb-0 d-flex flex-row">
          {words}
        </div>
      </div>
      <button id="step-forward" className="btn btn-primary" onClick={props.onForward}>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}

function InputForm(props) {
  if (props.isEnabled) {
    return (
      <form id="input-form" className="flex-grow-1">
        <input
          type="text"
          value={props.input}
          onChange={props.handleChange}
          className="form-control flex-grow-1"
        ></input>
        <div className="d-flex flex-row-reverse bd-highlight mb-3 g-0">
          <button
            id="debug-button"
            className="btn btn-primary ms-3"
            onClick={(e) => props.onDebug(e)}
          >
            Debug
          </button>
          <button id="execute-button" className="btn btn-primary ms-3">
            Execute
          </button>
        </div>
      </form>
    );
  } else {
    return null;
  }
}

function Stack(props) {
  const stackElements = props.stack.map((v,i) => <li key={i}>{JSON.stringify(v)}</li>)
  return (
    <div className="well">
      <ul id="stack">
        {stackElements} 
      </ul>
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "pause",
      input: "",
      environment: DEFAULT_ENVIRONMENT,
    };
  }

  handleDebuggerClick = (e) => {
    e.preventDefault();
    let newEnvironment = JSON.parse(JSON.stringify(this.state.environment));
    newEnvironment["Input"] = this.state.input.trim().split(" ");

    this.setState({
      mode: "debug",
      environment: newEnvironment,
    });
  };

  handleInputChange = (event) => {
    this.setState({
      input: event.target.value,
    });
  };

  onEnvironmentUpdate = (e) => {
    console.log(e);
    this.setState({
      environment: e
    });
  };

  handleStepForward = (event) => {
    $.post(STEPPER_URL, JSON.stringify(this.state.environment), this.onEnvironmentUpdate, "json");
  };

  render() {
    return (
      <div id="app-main">
        <div className="container-fluid g-0">
          <header>
            <div className="px-3 py-2 bg-dark bg-gradient text-white">
              <div className="container">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                  <h1>Forsch: A Forth Clone in C#</h1>
                </div>
              </div>
            </div>
          </header>
        </div>
        <div className="container g-0">
          <div className="row">
            <div className="col-lg-8 g-0">
              <Stepper onForward={this.handleStepForward} curLine={this.state.environment["Input"]} />
              <InputForm
                input={this.state.input}
                handleChange={this.handleInputChange}
                isEnabled={this.state.mode !== "debug"}
                onDebug={this.handleDebuggerClick}
              />
            </div>
            <div className="col-lg-4">
              <Stack stack={this.state.environment['DataStack']} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
