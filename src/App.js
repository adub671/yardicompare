import "./App.css";
import Compare from "./components/Compare";

function App() {
  return (
    <div className="page-container">
      <a href="https://ellensrealtyguam.com/">
        <img
          src="https://ellensrealtyguam.com/wp-content/uploads/2022/02/logo.svg"
          className="logo"
          alt="logo"
        ></img>
      </a>
      <h1>Ellen's Realty Yardi Report Comparison Tool</h1>
      <Compare />
    </div>
  );
}

export default App;
