import React, { createContext, useState } from "react";

const TradeWalletContext = createContext(null);

export function TradeWalletProvider({ children }) {
  const [trades, setTrades] = useState([]);

  const [wallet, setWallet] = useState({
    balance: 12543.65,
    holdings: {},
  });

  const addTrade = (trade) => {
    setTrades((prev) => [trade, ...prev]);
  };

  const addTradeFromChart = ({ coinSymbol, coinName, type, price, amount }) => {
    const numericAmount = Number(amount) || 0;
    const sym = coinSymbol || coinName;
    const delta = price * numericAmount;

    // Validation: buys require sufficient balance, sells require sufficient holdings
    if (type === "buy") {
      if (numericAmount <= 0) {
        return { success: false, message: "Invalid amount" };
      }
      if (wallet.balance < delta) {
        return { success: false, message: "Not enough funds" };
      }
    } else {
      // sell
      const available = wallet.holdings[sym] || 0;
      if (numericAmount <= 0) {
        return { success: false, message: "Invalid amount" };
      }
      if (available < numericAmount) {
        return { success: false, message: "Not enough holdings to sell" };
      }
    }

    const newTrade = {
      id: Date.now(),
      coin: sym,
      type: type === "buy" ? "LONG" : "SHORT",
      entry: price,
      exit: price,
      amount: numericAmount,
      status: "CLOSED",
    };

    setTrades((prev) => [newTrade, ...prev]);

    setWallet((prev) => {
      const holdings = { ...prev.holdings };
      if (type === "buy") {
        holdings[sym] = (holdings[sym] || 0) + numericAmount;
        return { ...prev, balance: prev.balance - delta, holdings };
      } else {
        holdings[sym] = Math.max(0, (holdings[sym] || 0) - numericAmount);
        return { ...prev, balance: prev.balance + delta, holdings };
      }
    });

    return { success: true };
  };

  return (
    <TradeWalletContext.Provider value={{ trades, wallet, addTrade, addTradeFromChart }}>
      {children}
    </TradeWalletContext.Provider>
  );
}

export default TradeWalletContext;
