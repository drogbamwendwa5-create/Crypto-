import React, { useState, useContext } from "react";
import TradeWalletContext from "../context/TradeWalletContext";

function Trades() {
  const { trades, addTrade } = useContext(TradeWalletContext);

  const [form, setForm] = useState({
    coin: "",
    type: "LONG",
    entry: "",
    exit: "",
    amount: "",
    status: "OPEN",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const calculatePnL = (trade) => {
    if (trade.status === "OPEN") return 0;

    const entry = Number(trade.entry);
    const exit = Number(trade.exit);
    const amount = Number(trade.amount);

    if (trade.type === "LONG") {
      return (exit - entry) * amount;
    } else {
      return (entry - exit) * amount;
    }
  };

  const addTradeLocal = (e) => {
    e.preventDefault();

    const newTrade = {
      id: Date.now(),
      ...form,
    };

    addTrade(newTrade);

    setForm({
      coin: "",
      type: "LONG",
      entry: "",
      exit: "",
      amount: "",
      status: "OPEN",
    });
  };

  const totalPnL = trades.reduce(
    (total, trade) => total + calculatePnL(trade),
    0
  );

  const closedTrades = trades.filter(
    (trade) => trade.status === "CLOSED"
  );

  const winningTrades = closedTrades.filter(
    (trade) => calculatePnL(trade) > 0
  );

  const losingTrades = closedTrades.filter(
    (trade) => calculatePnL(trade) < 0
  );

  return (
    <div className="app">
      <h1>Crypto Trade Log</h1>

      <div className="stats">
        <div className="card">
          <h2>Total Trades</h2>
          <p>{trades.length}</p>
        </div>

        <div className="card">
          <h2>Open Trades</h2>
          <p>
            {
              trades.filter((trade) => trade.status === "OPEN")
                .length
            }
          </p>
        </div>

        <div className="card">
          <h2>Closed Trades</h2>
          <p>{closedTrades.length}</p>
        </div>

        <div className="card">
          <h2>Total PnL</h2>

          <p className={totalPnL >= 0 ? "profit" : "loss"}>
            ${totalPnL.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <h2>Winning Trades</h2>
          <p>{winningTrades.length}</p>
        </div>

        <div className="card">
          <h2>Losing Trades</h2>
          <p>{losingTrades.length}</p>
        </div>
      </div>

      <div className="form-container">
        <h2>Add Trade</h2>

        <form onSubmit={addTradeLocal}>
          <input
            type="text"
            name="coin"
            placeholder="Coin (BTC)"
            value={form.coin}
            onChange={handleChange}
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option>LONG</option>
            <option>SHORT</option>
          </select>

          <input
            type="number"
            name="entry"
            placeholder="Entry Price"
            value={form.entry}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="exit"
            placeholder="Exit Price"
            value={form.exit}
            onChange={handleChange}
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option>OPEN</option>
            <option>CLOSED</option>
          </select>

          <button type="submit">Add Trade</button>
        </form>
      </div>

      <div className="table-container">
        <h2>Trade History</h2>

        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Amount</th>
              <th>Status</th>
              <th>PnL</th>
            </tr>
          </thead>

          <tbody>
            {trades.map((trade) => {
              const pnl = calculatePnL(trade);

              return (
                <tr key={trade.id}>
                  <td>{trade.coin}</td>

                  <td>{trade.type}</td>

                  <td>${trade.entry}</td>

                  <td>
                    {trade.exit ? `$${trade.exit}` : "-"}
                  </td>

                  <td>{trade.amount}</td>

                  <td>{trade.status}</td>

                  <td
                    className={
                      pnl >= 0 ? "profit" : "loss"
                    }
                  >
                    {trade.status === "OPEN"
                      ? "Running"
                      : `$${pnl.toFixed(2)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Trades;