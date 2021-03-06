import "./App.css";
import React from "react";
import {startsWith, compose, equals, prop, find, pipe} from "ramda";
import {getNewMoment, jsonDeepClone, peek} from "./utils.js";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const DEFAULT_ENVIRONMENT = {
  DataStack: [],
  WordDict: [
    /*
    {
      WordName: "BOXLINE",
      IsImmediate: false,
      WordText: '1 DUP 26 * 50 25 25 CRECT 1 + DUP 11 = BRANCH? 0'.split(" "),
    },
    {
      WordName: "CRECT",
      IsImmediate: false,
      WordText: 'RANDFILL . FILLRECT .'.split(" "),
    },
    {
      WordName: "FILLRECT",
      IsImmediate: false,
      WordText: 'ctx.fillRect( CALLF4'.split(" "),
    },
    {
      WordName: "RANDFILL",
      IsImmediate: false,
      WordText: '0 255 RAND 0 255 RAND 0 255 RAND ctx.fillStyle_=_\'rgb( " CALLF3 \' +'.split(" "),
    },
    {
      WordName: "CALLF1",
      IsImmediate: false,
      WordText: '" SWAP " + ) " + .'.split(" "),
    },
    {
      WordName: "CALLF2",
      IsImmediate: false,
      WordText: '" ROT " + ,_ " + SWAP " + ) " +'.split(" "), 
    },
    {
      WordName: "CALLF3",
      IsImmediate: false,
      WordText: '" 3 PICK " + ,_ " + ROT " + ,_ " + SWAP " + ) " +'.split(" "),
    },
    {
      WordName: "CALLF4",
      IsImmediate: false,
      WordText: '" 4 PICK " + ,_ " + 3 PICK " + ,_ " + 2 PICK " + ,_ " + 1 PICK " + ) +'.split(" "),
    },
    {
      WordName: "BEGIN",
      IsImmediate: true,
      WordText: ["HERE"],
    },
    {
      WordName: "UNTIL",
      IsImmediate: true,
      WordText: ["[", "BRANCH?", "]", ","],
    },
    */
  ],
  Input: [],
  InputIndex: 0,
  mode: "Execute",
  CurWordDef: null,
  CurWord: null,
  Output: "",
};

const STEPPER_URL = "/step";


function Menu(props) {
  const options = props.items;
  return (
    <Dropdown onChange={props.handleMenuChange} options={options} placeholder="Load dictionary..."/>
  );
}

function Word(props) {
  const currentClass = props.isCurrentWord ? "current-word" : "";
  const className =
    "btn btn-important word ms-2 text-white p-0 " + currentClass;
  if (props.isCurrentWord && props.curWordInDict) {
    return (
      <button
        className="btn btn-success p-0 ms-2"
        onClick={props.handleStepIn}
        value={props.wordString}
        key={props.i}
      >
        {props.wordString}
      </button>
    );
  } else {
    return (
      <button key={props.i} className={className} value={props.wordString}>
        {props.wordString}
      </button>
    );
  }
}

function HistorySlider(props) {
  return (
    <div className="range">
      <input
        onChange={props.historySliderChangeHandler}
        type="range"
        className="form-range"
        min="0"
        max={props.historyMaxIndex}
        value={props.curHistoryIndex}
        id="history-slider"
      />
    </div>
  );
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
        handleStepIn={props.handleStepIn}
        wordString={w}
      />
    );
  });

  const currentLineClasses =
    "flex-grow-1 form-control " +
    (props.isEnabled ? "bg-dark " : "bg-secondary ") + 
    (props.isCompileMode ? "compile-mode" : "");

  const stepperClass = 
    "btn " + 
    (props.isCompileMode ? "btn-warning" : "btn-primary");

  return (
    <div id="stepper" className="d-flex flex-row my-2">
      <button
        disabled={!props.isEnabled}
        id="step-back"
        onClick={props.onBackward}
        className={stepperClass}
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
        className={stepperClass}
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
      <div className="card-header d-flex justify-content-between">
        <button onClick={props.saveHandler} className="btn btn-secondary" id="save-dictionary"><i className="fas fa-save"></i></button>
        <div className="align-self-center">
          <i className="fas fa-book me-1"></i>Dictionary
        </div>
        <div></div>
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

class Canvas extends React.Component {
  componentDidUpdate() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for(const s of this.props.output) {
      if(startsWith('ctx.', s)) {
        eval(s)  
      }
    }
  }

  render() {
    return (
      <div className="d-flex justify-content-center">
        <canvas ref="canvas"/>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "10 50 25 25 CRECT",
      curHistoryIndex: 0,
      history: [{ output: [], mode: "pause", environments: [DEFAULT_ENVIRONMENT] }],
      menuItems: [],
    };
  }

  componentDidMount() {
    this.getMenuItems();      
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
      output: this.now().output,
      environments: this.now().environments.slice(0, -1).concat(newEnvironment),
    };

    this.setState((state, props) => {
      return {
        history: state.history
          .slice(0, state.curHistoryIndex + 1)
          .concat(newHistoryMoment),
        curHistoryIndex: state.curHistoryIndex + 1,
      };
    });
  };

  handleInputChange = (event) => {
    this.setState({
      input: event.target.value,
    });
  };

  // Update state in response to receipt of new environment from
  // Forsch web service.
  onEnvironmentUpdate = (e) => {
    const newMoment = getNewMoment(this.now(), e, this.state.input)

    this.setState({
      history: this.state.history
        .slice(0, this.state.curHistoryIndex + 1)
        .concat(newMoment),
      curHistoryIndex: this.state.curHistoryIndex + 1,
      input: "",
    });
  };

  now = () => {
    return this.state.history[this.state.curHistoryIndex];
  };

  handleSave = (event) => {
    const name = prompt("Enter a name for the environment:");
    if (name === null)
      return;
    
    const curEnv = peek(this.now().environments);
    const postBody = JSON.stringify({id: name, environment: curEnv}); 
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: postBody
    };
    fetch("/save", requestOptions)
      .then(response => response.json())
      .then(data => console.log("Saved."))
      .catch(error => console.log(error));
  }

  handleStepForward = (event) => {
    const postBody = pipe(peek, JSON.stringify)(this.now().environments);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: postBody
    };
    fetch(STEPPER_URL, requestOptions)
      .then((response) => response.json())
      .then((data) =>
        this.onEnvironmentUpdate(JSON.parse(data.EvalStepResult))
      )
      .catch((error) => console.log(error));
  };

  handleStepIn = (event) => {
    const wordName = event.target.value;
    const newEnv = pipe(peek, jsonDeepClone)(this.now().environments)
    const word = find(compose(equals(wordName), prop("WordName")), newEnv["WordDict"]);
    newEnv["Input"] = word["WordText"];
    newEnv["mode"] = word["IsImmediate"] ? "Execute" : newEnv["mode"];
    newEnv["InputIndex"] = 0;

    var newHistoryMoment = {
      environments: this.now().environments.concat(newEnv),
      mode: this.now().mode,
      output: this.now().output,
    };

    this.setState((state) => {
      return {
        input: this.state.input,
        history: state.history
          .slice(0, state.curHistoryIndex + 1)
          .concat(newHistoryMoment),
        curHistoryIndex: state.curHistoryIndex + 1,
      };
    });
  };

  handleStepBackward = () => {
    if (this.state.curHistoryIndex > 0) {
      this.setState((state) => {
        return { curHistoryIndex: state.curHistoryIndex - 1 };
      });
    }
  };

  historySliderChangeHandler = (e) => {
    this.setState((state) => {
      return { curHistoryIndex: parseInt(e.target.value) };
    });
  };

  getMenuItems = () => {
    fetch("/getList")
      .then(response => response.json())
      .then(data => this.setState({
        menuItems: data.dictionaries,          
      }))
      .catch(error => console.log(error));
  };

  handleMenuChange = (e) => {
    fetch("/load/" + e.value)
      .then(response => response.json())
      .then(data => this.setState(state => { return {
        input: state.input,
        curHistoryIndex: 0,
        history: [{ output: [], mode: "pause", environments: [JSON.parse(data)] }],
        menuItems: state.menuItems,
      };}))
      .catch(error => console.log(error));
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
          onBackward={this.handleStepBackward}
          onForward={this.handleStepForward}
          curWord={curWord(env)}
          curWordInDict={curWordInDict(env)}
          curIndex={env["InputIndex"]}
          curLine={env["Input"]}
          isEnabled={isEnabled}
          isCompileMode={env["mode"] === "Compile"}
          handleStepIn={isEnabled ? this.handleStepIn : () => {}}
        />
      );
    });

    return (
      <div id="app-main">
        <div className="container-fluid">
          <header>
            <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-light mb-4">
              <Menu items={this.state.menuItems} handleMenuChange={this.handleMenuChange}/>
              <h1 className="mt-1">
                <i className="fas fa-layer-group me-4"></i>Forsch: A Forth Clone
                in C#
              </h1>
              <div style={{'minWidth': 187}}></div>
            </div>
          </header>
        </div>
        <div id="body-container" className="container">
          <Canvas output={this.now().output} />
          <div className="row d-flex justify-content-center">
            <div className="row">
              <HistorySlider
                historySliderChangeHandler={this.historySliderChangeHandler}
                historyMaxIndex={this.state.history.length - 1}
                curHistoryIndex={this.state.curHistoryIndex}
              />
            </div>
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
              <Dictionary saveHandler={this.handleSave} dictionary={e["WordDict"]} curWord={curWord(e)} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
