import './App.css';

function Stepper() {
  return (
    <div id="stepper" className="d-flex flex-row">
      <button id="step-back" className="btn btn-primary"><i className="fas fa-chevron-left"></i></button>
      <div id="current-line" className="flex-grow-1 bg-dark form-control"><p id="code" className="text-white align-middle mb-0">1 ADD1 2 * .</p></div>
      <button id="step-forward" className="btn btn-primary"><i className="fas fa-chevron-right"></i></button>
    </div>
  );
}

function InputForm() {
  return (
    <form id="input-form" className="flex-grow-1">
      <input type="text" className="form-control flex-grow-1"></input> 
      <div className="d-flex flex-row-reverse bd-highlight mb-3 g-0">
        <button id="debug-button" className="btn btn-primary ms-3">Debug</button>
        <button id="execute-button" className="btn btn-primary ms-3">Execute</button>
      </div>
    </form>
  );
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

class App extends React.Component() {
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
            <Stepper/>
            <InputForm/>
          </div>
          <div className="col-lg-4">
            <Stack/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
