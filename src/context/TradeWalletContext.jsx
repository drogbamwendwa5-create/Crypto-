import React, { createContext, useState, useEffect, useCallback } from "react";

const TradeWalletContext = createContext(null);

// Helper functions for localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export function TradeWalletProvider({ children }) {
  // Load initial state from localStorage or use defaults
  const [trades, setTrades] = useState(() => loadFromStorage('cryptotrade_trades', []));
  const [wallet, setWallet] = useState(() => loadFromStorage('cryptotrade_wallet', {
    balance: 12543.65,
    holdings: {},
  }));
  const [userSettings, setUserSettings] = useState(() => loadFromStorage('cryptotrade_settings', {
    username: "crypto_trader",
    email: "trader@example.com",
    displayName: "Crypto Trader",
    bio: "Passionate about cryptocurrency trading",
    currency: "USD",
    theme: "dark",
    notifications: true,
    twoFactorAuth: false,
  }));
  const [notifications, setNotifications] = useState([]);

  // Persist trades to localStorage whenever they change
  useEffect(() => {
    saveToStorage('cryptotrade_trades', trades);
  }, [trades]);

  // Persist wallet to localStorage whenever it changes
  useEffect(() => {
    saveToStorage('cryptotrade_wallet', wallet);
  }, [wallet]);

  // Persist user settings to localStorage whenever they change
  useEffect(() => {
    saveToStorage('cryptotrade_settings', userSettings);
  }, [userSettings]);

  // Add notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Add balance (for deposits)
  const addBalance = useCallback((amount) => {
    setWallet(prev => ({ ...prev, balance: prev.balance + amount }));
  }, []);

  const addTrade = (trade) => {
    setTrades((prev) => [trade, ...prev]);
    addNotification(`New trade added: ${trade.coin} ${trade.type}`, 'success');
  };

  const deleteTrade = useCallback((tradeId) => {
    setTrades((prev) => prev.filter(t => t.id !== tradeId));
    addNotification('Trade deleted successfully', 'info');
  }, [addNotification]);

  const updateTradeStatus = useCallback((tradeId, newStatus, exitPrice = null) => {
    setTrades((prev) => prev.map(trade => {
      if (trade.id === tradeId) {
        const updated = { ...trade, status: newStatus };
        if (exitPrice !== null) {
          updated.exit = exitPrice;
        }
        return updated;
      }
      return trade;
    }));
    addNotification(`Trade ${newStatus.toLowerCase()}`, 'success');
  }, [addNotification]);

  const addTradeFromChart = ({ coinSymbol, coinName, type, price, amount }) => {
    const numericAmount = Number(amount) || 0;
    const sym = coinSymbol?.toUpperCase() || coinName?.toUpperCase() || 'UNKNOWN';
    const delta = price * numericAmount;

    // Validation: buys require sufficient balance, sells require sufficient holdings
    if (type === "buy") {
      if (numericAmount <= 0) {
        return { success: false, message: "Invalid amount - must be greater than 0" };
      }
      if (wallet.balance < delta) {
        return { 
          success: false, 
          message: `Not enough funds. Required: $${delta.toFixed(2)}, Available: $${wallet.balance.toFixed(2)}` 
        };
      }
    } else {
      // sell
      const available = wallet.holdings[sym] || 0;
      if (numericAmount <= 0) {
        return { success: false, message: "Invalid amount - must be greater than 0" };
      }
      if (available < numericAmount) {
        return { 
          success: false, 
          message: `Not enough ${sym} to sell. Available: ${available}, Attempted: ${numericAmount}` 
        };
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
      timestamp: new Date().toISOString(),
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

    addNotification(
      `${type === 'buy' ? 'Bought' : 'Sold'} ${numericAmount} ${sym} at $${price.toFixed(2)}`,
      'success'
    );

    return { success: true };
  };

  const updateProfile = useCallback((updates) => {
    setUserSettings(prev => ({ ...prev, ...updates }));
    addNotification('Profile updated successfully', 'success');
  }, [addNotification]);

  const updatePreferences = useCallback((updates) => {
    setUserSettings(prev => ({ ...prev, ...updates }));
    addNotification('Preferences saved', 'success');
  }, [addNotification]);

  // Calculate portfolio value based on current holdings (would need live prices in production)
  const getPortfolioValue = useCallback(() => {
    // This is a simplified version - in production you'd fetch live prices
    return wallet.balance;
  }, [wallet.balance]);

  return (
    <TradeWalletContext.Provider value={{ 
      trades, 
      wallet, 
      userSettings,
      notifications,
      addTrade, 
      addTradeFromChart,
      deleteTrade,
      updateTradeStatus,
      updateProfile,
      updatePreferences,
      addNotification,
      removeNotification,
      addBalance,
      getPortfolioValue
    }}>
      {children}
    </TradeWalletContext.Provider>
  );
}

// Custom hook for using the context
export const useTradeWallet = () => {
  const context = React.useContext(TradeWalletContext);
  if (!context) {
    throw new Error('useTradeWallet must be used within a TradeWalletProvider');
  }
  return context;
};

export default TradeWalletContext;
