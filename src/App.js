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

function jsonDeepClone(json) {
  return JSON.parse(JSON.stringify(json));
}

function Word(props) {
  const currentClass = props.isCurrentWord ? "current-word" : "";
  const className = "word ms-2 text " + currentClass;

  if (props.isCurrentWord && props.curWordInDict) {
    return (
      <button
        className="btn btn-success p-0 ms-2"
        onClick={props.stepInHandler}
        key={props.i}
      >
        {props.wordString}
      </button>
    );
  } else {
    return (
      <div key={props.i} className={className}>
        {props.wordString}
      </div>
    );
  }
}

function Stepper(props) {
  const words = props.curLine.map((w, i) => {
    const isCurrentWord = i === props.curIndex;
    return (
      <Word
        key={i}
        curIndex={props.curIndex}
        isCurrentWord={isCurrentWord}
        curWordInDict={props.curWordInDict}
        wordString={w}
      />
    );
  });

  const currentLineClasses =
    "flex-grow-1 form-control " +
    (props.isEnabled ? "bg-dark" : "bg-secondary");

  return (
    <div id="stepper" className="d-flex flex-row my-2">
      <button
        disabled={!props.isEnabled}
        id="step-back"
        className="btn btn-primary"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <div id="current-line" className={currentLineClasses}>
        <div id="code" className="text-white align-middle mb-0 d-flex flex-row">
          {words}
        </div>
      </div>
      <button
        id="step-forward"
        className="btn btn-primary"
        onClick={props.onForward}
        disabled={!props.isEnabled}
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
        className="form-control flex-grow-1 my-2"
        disabled={!props.isEnabled}
      ></input>
      <div className="d-flex flex-row-reverse bd-highlight mb-3 g-0">
        <button
          id="debug-button"
          className="btn btn-primary ms-3"
          onClick={(e) => props.onDebug(e)}
          disabled={!props.isEnabled}
        >
          <i className="fas fa-bug me-2"></i>Debug
        </button>
        <button
          disabled={!props.isEnabled}
          id="execute-button"
          className="btn btn-primary ms-3"
        >
          <i className="fas fa-play me-2"></i>Execute
        </button>
      </div>
    </form>
  );
}

function Dictionary(props) {
  const words = props.dictionary.map((w) => {
    const immediateMarker = w["IsImmediate"] ? (
      <i className="fas fa-bolt me-1" title="Immediate Word"></i>
    ) : null;
    const wordClass =
      w["WordName"] === props.curWord ? "dictionary-current-word" : "bg-light";
    return (
      <tr key={w["WordName"]} className={wordClass}>
        <td>
          {immediateMarker}
          {w["WordName"]}
        </td>
        <td>{w["WordText"].join(" ")}</td>
      </tr>
    );
  });

  return (
    <div id="dictionary" className="card">
      <div className="card-header text-center">
        <i className="fas fa-book me-1"></i>Dictionary
      </div>
      <div className="card-body">
        <table className="table table-bordered">
          <thead className="bg-light">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Definition</th>
            </tr>
          </thead>
          <tbody>{words}</tbody>
        </table>
      </div>
    </div>
  );
}

function Stack(props) {
  const stackElements = props.stack
    .map((v, i) => {
      const className = "word-" + v["type"].toLowerCase();
      const wrapper = v["type"] === "FStr" ? '"' : "";
      return (
        <li className={className + " list-group-item text-center mx-2"} key={i}>
          {wrapper + v["value"] + wrapper}
        </li>
      );
    })
    .reverse();

  return (
    <div id="stack" className="card">
      <div className="card-header text-center">
        <i className="fas fa-layer-group me-1"></i>Stack
      </div>
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
      input: ": ADD1 1 + ;",
      environment: DEFAULT_ENVIRONMENT,
    };
  }

  handleDebuggerClick = (e) => {
    e.preventDefault();
    let newEnvironment = jsonDeepClone(this.state.environment);
    newEnvironment["Input"] = this.state.input.trim().split(" ");
    newEnvironment["mode"] = "Execute";
    newEnvironment["InputIndex"] = 0;
    newEnvironment["CurWordDef"] = [];
    newEnvironment["CurWord"] = "";

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
    const inputIsComplete = e["InputIndex"] === e["Input"].length;
    this.setState((state) => {
      return {
        environment: e,
        mode: inputIsComplete ? "pause" : state.mode,
        input: inputIsComplete ? "" : state.input,
      };
    });
  };

  handleStepForward = (event) => {
    console.log(JSON.stringify(this.state.environment));
    $.post(
      STEPPER_URL,
      JSON.stringify(this.state.environment),
      this.onEnvironmentUpdate,
      "json"
    );
  };

  render() {
    const e = this.state.environment;
    const curWord = e["Input"].length !== 0 ? e["Input"][e["InputIndex"]] : "";
    const curWordInDict = e["WordDict"].some((w) => w["WordName"] === curWord);
    console.log(curWordInDict);

    return (
      <div id="app-main">
        <div className="container-fluid">
          <header>
            <div className="d-flex justify-content-center px-3 py-2 bg-light mb-4">
              <h1>
                <i className="fas fa-layer-group me-4"></i>Forsch: A Forth Clone
                in C#
              </h1>
            </div>
          </header>
        </div>
        <div id="body-container" className="container">
          <div className="row d-flex justify-content-center">
            <div className="">
              <Stepper
                onForward={this.handleStepForward}
                curWord={curWord}
                curWordInDict={curWordInDict}
                curIndex={this.state.environment["InputIndex"]}
                curLine={this.state.environment["Input"]}
                isEnabled={this.state.mode === "debug"}
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
              <Dictionary
                dictionary={this.state.environment["WordDict"]}
                curWord={curWord}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
