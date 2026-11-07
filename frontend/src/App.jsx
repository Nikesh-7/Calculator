import { useEffect, useState } from "react";
import { Calculator, Clock3, Delete, History, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/calculations";
const keys = [
  { label: "AC", kind: "utility" }, { label: "DEL", kind: "utility" }, { label: "%", kind: "utility" }, { label: "÷", kind: "operator" },
  { label: "7" }, { label: "8" }, { label: "9" }, { label: "×", kind: "operator" },
  { label: "4" }, { label: "5" }, { label: "6" }, { label: "−", kind: "operator" },
  { label: "1" }, { label: "2" }, { label: "3" }, { label: "+", kind: "operator" },
  { label: "±", kind: "utility" }, { label: "0" }, { label: "." }, { label: "=", kind: "equals" }
];

const operatorMap = { "+": "ADD", "−": "SUBTRACT", "×": "MULTIPLY", "÷": "DIVIDE" };

function format(value) {
  if (!Number.isFinite(value)) return "Error";
  return Number.parseFloat(value.toPrecision(12)).toString();
}

export default function App() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load history");
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Backend is not connected. Start the Spring Boot API and check the database settings.");
    }
  }

  useEffect(() => { loadHistory(); }, []);

  function inputDigit(value) {
    setDisplay(current => waiting || current === "0" || current === "Error" ? value : current.length < 15 ? current + value : current);
    setWaiting(false);
  }

  function chooseOperator(symbol) {
    const value = Number(display);
    if (!Number.isFinite(value)) return;
    if (stored !== null && operator && !waiting) {
      const result = calculateLocal(stored, value, operator);
      setStored(result);
      setDisplay(format(result));
    } else {
      setStored(value);
    }
    setOperator(symbol);
    setWaiting(true);
  }

  function calculateLocal(a, b, op) {
    if (op === "+") return a + b;
    if (op === "−") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") return b === 0 ? NaN : a / b;
    return b;
  }

  async function equals() {
    if (stored === null || !operator || waiting) return;
    const secondNumber = Number(display);
    const firstNumber = stored;
    const op = operator;
    const localResult = calculateLocal(firstNumber, secondNumber, op);
    setOperator(null);
    setStored(null);
    setWaiting(true);

    if (!Number.isFinite(localResult)) {
      setDisplay("Error");
      setError("Cannot divide by zero.");
      return;
    }

    setDisplay(format(localResult));
    setBusy(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstNumber, secondNumber, operator: operatorMap[op] })
      });
      if (!response.ok) throw new Error("Save failed");
      const saved = await response.json();
      setHistory(current => [saved, ...current]);
      setError("");
    } catch {
      setError("Result calculated on this device, but could not be saved. Check your backend connection.");
    } finally {
      setBusy(false);
    }
  }

  function press(label) {
    setError("");
    if (/^\d$/.test(label)) return inputDigit(label);
    if (label === ".") {
      if (waiting) { setDisplay("0."); setWaiting(false); }
      else if (!display.includes(".")) setDisplay(display + ".");
      return;
    }
    if (label === "AC") { setDisplay("0"); setStored(null); setOperator(null); setWaiting(false); return; }
    if (label === "DEL") { setDisplay(current => current.length > 1 ? current.slice(0, -1) : "0"); return; }
    if (label === "±") { setDisplay(current => current === "0" ? current : current.startsWith("-") ? current.slice(1) : "-" + current); return; }
    if (label === "%") { setDisplay(format(Number(display) / 100)); return; }
    if (label === "=") return equals();
    if (operatorMap[label]) return chooseOperator(label);
  }

  async function clearHistory() {
    try {
      const response = await fetch(API_URL, { method: "DELETE" });
      if (!response.ok) throw new Error("Clear failed");
      setHistory([]);
      setError("");
    } catch {
      setError("Could not clear saved history. Check your backend connection.");
    }
  }

  function useHistory(item) {
    setDisplay(format(item.result));
    setStored(null);
    setOperator(null);
    setWaiting(true);
  }

  return (
    <main className="app">
      <header className="header">
        <a className="logo" href="#"><span className="logo-mark"><Calculator size={19}/></span> NOVA<span>CALC</span></a>
        <div className="header-status"><i /> PRECISION, SIMPLIFIED</div>
      </header>

      <section className="intro">
        <div className="tag">YOUR EVERYDAY CALCULATOR</div>
        <h1>Make numbers <em>make sense.</em></h1>
        <p>A clean space for quick calculations and a history you can revisit.</p>
      </section>

      {error && <div className="error-banner" role="alert">{error}<button onClick={loadHistory}>Retry</button></div>}

      <section className="workspace">
        <div className="calculator-card">
          <div className="calc-top"><span><span className="online-dot"/> STANDARD</span><span>01 / CALCULATOR</span></div>
          <div className="screen">
            <div className="expression">{stored !== null && operator ? `${format(stored)} ${operator}` : "READY WHEN YOU ARE"}</div>
            <div className="display" aria-live="polite">{display}</div>
            <div className="screen-foot">{busy ? <><LoaderCircle size={13} className="spin"/> Saving calculation</> : "NOVA • BASIC MODE"}</div>
          </div>
          <div className="keypad">
            {keys.map(key => (
              <button key={key.label} onClick={() => press(key.label)} className={`key ${key.kind || ""} ${key.label === "0" ? "zero" : ""}`} aria-label={key.label}>
                {key.label === "DEL" ? <Delete size={19}/> : key.label}
              </button>
            ))}
          </div>
          <div className="calc-caption"><span>⌁</span> Your calculations are saved to your history.</div>
        </div>

        <aside className="history-card">
          <div className="history-head">
            <div><div className="history-icon"><History size={17}/></div><h2>History</h2><p>Your recent calculations</p></div>
            <button className="clear-button" onClick={clearHistory} disabled={!history.length} title="Clear history"><Trash2 size={15}/></button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty"><Clock3 size={25}/><strong>No calculations yet</strong><span>Your results will appear here.</span></div>
            ) : history.map(item => (
              <button className="history-item" key={item.id} onClick={() => useHistory(item)}>
                <span className="history-equation">{format(item.firstNumber)} {({ADD:"+",SUBTRACT:"−",MULTIPLY:"×",DIVIDE:"÷"})[item.operator] || item.operator} {format(item.secondNumber)}</span>
                <strong>{format(item.result)}</strong>
              </button>
            ))}
          </div>
          <div className="history-foot"><span><i/> DATABASE SYNC</span><span>{history.length} SAVED</span></div>
        </aside>
      </section>

      <footer><span>BUILT WITH REACT + SPRING BOOT</span><span>POWERED BY POSTGRESQL <b>✦</b></span></footer>
    </main>
  );
}
