import $ from "jquery";
import "./App.css";
import React from "react";

const DEFAULT_ENVIRONMENT = {
  DataStack: [],
  WordDict: [],
  Input: ["1", "1", "+"],
  InputIndex: 0,
  mode: "Execute",
  CurWordDef: [],
  CurWord: '',
};

const STEPPER_URL = "http://localhost:3000/step";

function Stepper(props) {
  return (
    <div id="stepper" className="d-flex flex-row">
      <button id="step-back" className="btn btn-primary">
        <i className="fas fa-chevron-left"></i>
      </button>
      <div id="current-line" className="flex-grow-1 bg-dark form-control">
        <p id="code" className="text-white align-middle mb-0">
          {props.curLine}
        </p>
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

function Stack() {
  return (
    <div className="well">
      <ul id="stack">
        <li>1</li>
        <li>1</li>
        <li>a_string</li>
      </ul>
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curLine: "",
      mode: "pause",
      input: "",
      environment: DEFAULT_ENVIRONMENT,
    };
  }

  handleDebuggerClick = (e) => {
    e.preventDefault();
    this.setState({
      mode: "debug",
      curLine: this.state.input,
    });
  };

  handleInputChange = (event) => {
    this.setState({
      input: event.target.value,
    });
  };

  onEnvironmentUpdate = (e) => {
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
              <Stepper onForward={this.handleStepForward} curLine={this.state.curLine} />
              <InputForm
                input={this.state.input}
                handleChange={this.handleInputChange}
                isEnabled={this.state.mode !== "debug"}
                onDebug={this.handleDebuggerClick}
              />
            </div>
            <div className="col-lg-4">
              <Stack />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
