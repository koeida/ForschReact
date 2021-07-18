import "./App.css";
import React from "react";

const DEFAULT_ENVIRONMENT = {
  DataStack: [],
  WordDict: [
    { WordName: "ADD1", IsImmediate: false, WordText: ["1", "+"] },
    { WordName: "ADD2", IsImmediate: false, WordText: ["ADD1", "ADD1"] },
  ],
  Input: [],
  InputIndex: 0,
  mode: "Execute",
  CurWordDef: [],
  CurWord: "",
};

const STEPPER_URL = "/step";

function jsonDeepClone(json) {
  return JSON.parse(JSON.stringify(json));
}
function peek(a) {
  return a.slice(-1)[0];
}

function dropWhile(f, a) {
  if (a.length === 0) {
    return [];
  }

  if (!f(a[0])) {
    return a;
  } else {
    return dropWhile(f, a.slice(1));
  }
}

function Word(props) {
  const currentClass = props.isCurrentWord ? "current-word" : "";
  const className = "btn btn-important word ms-2 text-white p-0 " + currentClass;
  if (props.isCurrentWord && props.curWordInDict) {
    return (
      <button
        className="btn btn-success p-0 ms-2"
        onClick={props.stepInHandler}
        value={props.wordString}
        key={props.i}
      >
        {props.wordString}
      </button>
    );
  } else {
    return (
      <button key={props.i} className={className} value={props.wordString}>{props.wordString}</button>
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
        stepInHandler={props.stepInHandler}
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
      input: "1 ADD2 ADD2",
      curHistoryIndex: 0,
      history: [{mode: "pause", environments:[DEFAULT_ENVIRONMENT]}],
    };
  }

  handleDebuggerClick = (e) => {
    e.preventDefault();
    let newEnvironment = jsonDeepClone(peek(this.now().environments));
    newEnvironment["Input"] = this.state.input.trim().split(" ");
    newEnvironment["mode"] = "Execute";
    newEnvironment["InputIndex"] = 0;
    newEnvironment["CurWordDef"] = [];
    newEnvironment["CurWord"] = "";

    const newHistoryMoment = {
      mode: "debug",
      environments: this.now().environments.slice(0, -1).concat(newEnvironment),
    }

    this.setState((state, props) => {
      return {
        history: state.history.concat(newHistoryMoment),
        curHistoryIndex: state.curHistoryIndex + 1,
      };
    });
  };

  handleInputChange = (event) => {
    this.setState({
      input: event.target.value,
    });
  };

  onEnvironmentUpdate = (e) => {
    const inputIsComplete = e["InputIndex"] === e["Input"].length;
    const curEnvironments = this.now().environments;
    var newEnvironments;
    var newMode;
    var newInput;
    if (inputIsComplete && curEnvironments.length === 1) {
      newEnvironments = curEnvironments.slice(0, -1).concat(e);
      newMode = "pause";
      newInput = "";
    } else if (inputIsComplete && curEnvironments.length > 1) {
      //If the new environment is at the end of its input, we need to
      //continue destroying environments until we get to one that is
      //unfinished.
      var remainingEnvironments = dropWhile(
        (env) => env["InputIndex"] === env["Input"].length - 1,
        curEnvironments.reverse()
      ).reverse();

      if (remainingEnvironments.length === 0) {
        newMode = "pause"
        newInput = ""
        newEnvironments = [e];
      } else {
        const newHeadEnv = peek(remainingEnvironments);
        newHeadEnv["DataStack"] = e["DataStack"];
        newHeadEnv["InputIndex"] += 1;
        newEnvironments = remainingEnvironments.slice(0, -1).concat(newHeadEnv);
        newInput = this.state.input;
        newMode = this.now().mode;
      }

    } else if (!inputIsComplete) {
      newEnvironments = curEnvironments.slice(0, -1).concat(e);
      newMode = this.now().mode;
      newInput = this.state.input;
    }

    const newHistoryMoment = {
      mode: newMode,
      environments: newEnvironments,
    };

    this.setState(state => {
      return {
        history: state.history.concat(newHistoryMoment),
        curHistoryIndex: state.curHistoryIndex + 1,
        input: newInput,
      };
    });
  };

  now = () => {
    return this.state.history[this.state.curHistoryIndex];
  };

  handleStepForward = (event) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peek(this.now().environments))
    };
    fetch(STEPPER_URL, requestOptions)
        .then(response => response.json())
        .then(data => this.onEnvironmentUpdate(JSON.parse(data.EvalStepResult)))
  };

  stepInHandler = (event) => {
    const word = event.target.value;
    const newEnv = jsonDeepClone(peek(this.now().environments));
    newEnv["Input"] = newEnv["WordDict"].find((w) => w["WordName"] === word)[
      "WordText"
    ];
    newEnv["InputIndex"] = 0;

    var newHistoryMoment = {
      environments: this.now().environments.concat(newEnv),
      mode: this.now().mode,
    };

    this.setState(state => {
      return {
      input: this.state.input,
        history: state.history.concat(newHistoryMoment),
        curHistoryIndex: state.curHistoryIndex + 1,
      };
    });
  };

  render() {
    const e = peek(this.now().environments);
    const curWord = (env) =>
      env["Input"].length !== 0 ? env["Input"][env["InputIndex"]] : "";
    const curWordInDict = (env) =>
      env["WordDict"].some((w) => w["WordName"] === curWord(env));
    const steppers = this.now().environments.map((env, i) => {
      const isEnabled =
        i === this.now().environments.length - 1 && this.now().mode === "debug";
      return (
        <Stepper
          key={i}
          onForward={this.handleStepForward}
          curWord={curWord(env)}
          curWordInDict={curWordInDict(env)}
          curIndex={env["InputIndex"]}
          curLine={env["Input"]}
          isEnabled={isEnabled}
          stepInHandler={isEnabled ? this.stepInHandler : () => {}}
        />
      );
    });

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
              {steppers}
              <InputForm
                input={this.state.input}
                handleChange={this.handleInputChange}
                isEnabled={this.now().mode !== "debug"}
                onDebug={this.handleDebuggerClick}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <Stack stack={e["DataStack"]} />
            </div>
            <div className="col-8">
              <Dictionary dictionary={e["WordDict"]} curWord={curWord(e)} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
