import React, { useContext, useState } from "react";
import TradeWalletContext from "../context/TradeWalletContext";

function Wallet() {
  const { wallet, trades, addTradeFromChart } = useContext(TradeWalletContext);

  const [sendForm, setSendForm] = useState({ address: "", amount: "", coin: "BTC" });

  const handleChange = (e) => {
    setSendForm({ ...sendForm, [e.target.name]: e.target.value });
  };

  const sendCrypto = (e) => {
    e.preventDefault();
    if (!sendForm.address || !sendForm.amount) {
      alert("Fill all fields");
      return;
    }

    // treat send as a sell for now, price unknown => 0
    const res = addTradeFromChart({ coinSymbol: sendForm.coin, coinName: sendForm.coin, type: "sell", price: 0, amount: sendForm.amount });
    if (!res || !res.success) {
      alert(res?.message || "Transaction failed");
      return;
    }

    alert("Transaction Successful");

    setSendForm({ address: "", amount: "", coin: "BTC" });
  };

  return (
    <div className="wallet">
      <h1>Crypto Wallet</h1>

      <div className="balance-card">
        <h2>Total Balance</h2>
        <p>${wallet.balance.toLocaleString()}</p>
      </div>

      <h2>Your Assets</h2>

      <div className="coins-container">
        {Object.entries(wallet.holdings).length === 0 ? (
          <p style={{ color: '#9fb2c7' }}>No holdings yet</p>
        ) : (
          Object.entries(wallet.holdings).map(([sym, amt]) => (
            <div className="coin-card" key={sym}>
              <h3>{sym}</h3>
              <p>{amt} {sym}</p>
            </div>
          ))
        )}
      </div>

      <div className="send-section">
        <h2>Send Crypto</h2>

        <form onSubmit={sendCrypto}>
          <input type="text" name="address" placeholder="Wallet Address" value={sendForm.address} onChange={handleChange} />

          <input type="number" name="amount" placeholder="Amount" value={sendForm.amount} onChange={handleChange} />

          <select name="coin" value={sendForm.coin} onChange={handleChange}>
            <option>BTC</option>
            <option>ETH</option>
            <option>SOL</option>
          </select>

          <button type="submit">Send</button>
        </form>
      </div>

      <div className="transactions">
        <h2>Transaction History</h2>

        {trades.map((tx) => (
          <div className="transaction" key={tx.id}>
            <p>{tx.type}</p>
            <p>{tx.coin}</p>
            <p>{tx.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wallet;
