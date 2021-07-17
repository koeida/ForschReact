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
  CurWord: "",
};

const STEPPER_URL = "http://localhost:3000/step";

function Word(props) {
  const currentClass = props.isCurrentWord ? "current-word" : "";
  const className = "word ms-2 fs-3 text " + currentClass;
  return (
    <div key={props.i} className={className}>
      {props.wordString}
    </div>
  );
}

function Stepper(props) {
  const words = props.curLine.map((w, i) => {
    const isCurrentWord = i === props.curWordIndex;
    return <Word key={i} isCurrentWord={isCurrentWord} wordString={w} />;
  });

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
      <button
        id="step-forward"
        className="btn btn-primary"
        onClick={props.onForward}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}

function InputForm(props) {
    return (
      <form id="input-form" className="flex-grow-1">
        <input
          type="text"
          value={props.input}
          onChange={props.handleChange}
          className="form-control flex-grow-1"
          disabled={!props.isEnabled}
        ></input>
        <div className="d-flex flex-row-reverse bd-highlight mb-3 g-0">
          <button
            id="debug-button"
            className="btn btn-primary ms-3"
            onClick={(e) => props.onDebug(e)}
            disabled={!props.isEnabled}
          >
            <i class="fas fa-bug me-2"></i>Debug
          </button>
          <button disabled={!props.isEnabled} id="execute-button" className="btn btn-primary ms-3">
            <i class="fas fa-play me-2"></i>Execute
          </button>
        </div>
      </form>
    );
}

function Stack(props) {
  const stackElements = props.stack.map((v, i) => {
    const className = "word-" + v["type"].toLowerCase();
    const wrapper = v["type"] === "FStr" ? "\"" : "";
    return <li className={className + " bg-dark list-group-item text-center fs-3 mx-2"} key={i}>{wrapper + v["value"] + wrapper}</li>
  }).reverse();

  return (
      <div id="stack" className="card">
        <div className="card-header text-center text-white fs-3">Stack</div>
        <div className="card-body">
          <ul className="list-group">{stackElements}</ul>
        </div>
      </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "pause",
      input: "1 2 SWAP 3 4 SWAP + + + 10 =",
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
      environment: e,
    });
  };

  handleStepForward = (event) => {
    $.post(
      STEPPER_URL,
      JSON.stringify(this.state.environment),
      this.onEnvironmentUpdate,
      "json"
    );
  };

  render() {
    return (
      <div id="app-main">
        <div className="container-fluid">
          <header>
            <div className="d-flex justify-content-center px-3 py-2 bg-light mb-4">
                <h1><i className="fas fa-layer-group me-4"></i>Forsch: A Forth Clone in C#</h1>
            </div>
          </header>
        </div>
        <div id="body-container" className="container">
          <div className="row d-flex justify-content-center">
            <div className="">
              <Stepper
                onForward={this.handleStepForward}
                curWordIndex={this.state.environment["InputIndex"]}
                curLine={this.state.environment["Input"]}
              />
              <InputForm
                input={this.state.input}
                handleChange={this.handleInputChange}
                isEnabled={this.state.mode !== "debug"}
                onDebug={this.handleDebuggerClick}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <Stack stack={this.state.environment["DataStack"]} />
            </div>
            <div className="col-8">
              <p>Dictionary goes here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
