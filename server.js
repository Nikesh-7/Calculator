const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Calculation history (kept in memory; resets when the server restarts)
let history = [];

function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) throw new Error("Cannot divide by 0");
      return a / b;
    default:
      throw new Error("Unknown operator");
  }
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/calculate", (req, res) => {
  const a = Number(req.body.a);
  const b = Number(req.body.b);
  const op = req.body.op;

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return res.status(400).json({ error: "Invalid numbers" });
  }

  try {
    const raw = calculate(a, b, op);
    const result = Number(raw.toPrecision(12));
    const entry = { expression: `${a} ${op} ${b}`, result, at: new Date().toISOString() };
    history.unshift(entry);
    history = history.slice(0, 20);
    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/history", (req, res) => res.json(history));

app.delete("/api/history", (req, res) => {
  history = [];
  res.json({ cleared: true });
});

app.listen(PORT, () => console.log(`Calculator running on port ${PORT}`));
