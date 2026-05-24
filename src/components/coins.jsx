import { useEffect, useState, useContext, useRef } from "react";
import TradeWalletContext from "../context/TradeWalletContext";

const compactCurrency = new Intl.NumberFormat("en-US", {
  compactDisplay: "short",
  currency: "USD",
  maximumFractionDigits: 2,
  notation: "compact",
  style: "currency",
});

const fullCurrency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

function Coins() {
  const [coins, setCoins] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true",
        );
        if (!response.ok) throw new Error(`Failed to fetch coins: ${response.status}`);
        const data = await response.json();
        if (isMounted) {
          setCoins(data);
          setSelectedCoinId(data[0]?.id ?? "");
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCoins();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return (
    <div className="app">
      <div className="status-panel">
        <div className="loader" aria-hidden="true" />
        <h1>Loading market data</h1>
        <p>Fetching the latest coin prices.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="app">
      <div className="status-panel status-panel--error">
        <h1>Error loading coins</h1>
        <p>{error}</p>
      </div>
    </div>
  );

  const marketCap = coins.reduce((total, coin) => total + (coin.market_cap || 0), 0);
  const dailyVolume = coins.reduce((total, coin) => total + (coin.total_volume || 0), 0);
  const leaders = coins.slice(0, 100);
  const selectedCoin = leaders.find((c) => c.id === selectedCoinId) || leaders[0];

  return (
    <div className="app">
      <header className="market-header">
        <div>
          <p className="eyebrow">Live crypto board</p>
          <h1>Crypto Market</h1>
          <p className="intro">Track the top digital assets by market cap, price movement, volume, and supply.</p>
        </div>

        <div className="market-summary" aria-label="Market summary">
          <div>
            <span>Total cap</span>
            <strong>{compactCurrency.format(marketCap)}</strong>
          </div>
          <div>
            <span>24h volume</span>
            <strong>{compactCurrency.format(dailyVolume)}</strong>
          </div>
          <div>
            <span>Assets</span>
            <strong>{leaders.length}</strong>
          </div>
        </div>
      </header>

      {selectedCoin && (
        <PriceChart
          coin={selectedCoin}
          coins={leaders}
          onSelectCoin={setSelectedCoinId}
          selectedCoinId={selectedCoin.id}
        />
      )}

      <div className="coins-container">
        {leaders.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  );
}

function PriceChart({ coin, coins, onSelectCoin, selectedCoinId }) {
  const [candleData, setCandleData] = useState(() => {
    const initialCandle = {
      open: coin.current_price,
      high: coin.current_price,
      low: coin.current_price,
      close: coin.current_price,
    };
    return [initialCandle];
  });
  const [currentPrice, setCurrentPrice] = useState(coin.current_price);
  const intervalRef = useRef(null);
  const priceHistoryRef = useRef([]);
  
  const { addTradeFromChart } = useContext(TradeWalletContext);

  useEffect(() => {
    // Initialize with current price
    priceHistoryRef.current = [{ price: coin.current_price, time: Date.now() }];
    setCurrentPrice(coin.current_price);
    
    // Reset candle data when coin changes
    setCandleData([{
      open: coin.current_price,
      high: coin.current_price,
      low: coin.current_price,
      close: coin.current_price,
    }]);

    // Fetch price every 20 seconds
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`
        );
        if (!response.ok) return;
        const data = await response.json();
        const newPrice = data[coin.id]?.usd || coin.current_price;
        setCurrentPrice(newPrice);
        
        priceHistoryRef.current.push({ price: newPrice, time: Date.now() });
        
        // Keep last 60 data points (20 minutes of data at 20s intervals)
        if (priceHistoryRef.current.length > 60) {
          priceHistoryRef.current.shift();
        }

        // Update candles - create new candle every 2 price updates (40 seconds per candle)
        setCandleData(prev => {
          const historyLength = priceHistoryRef.current.length;
          
          // Create new candle every 2 updates (40 seconds)
          if (historyLength % 2 === 1 && historyLength > 1) {
            const newCandle = {
              open: newPrice,
              high: newPrice,
              low: newPrice,
              close: newPrice,
            };
            return [...prev.slice(-19), newCandle]; // Keep last 20 candles
          } else {
            // Update existing candle
            const lastCandle = prev[prev.length - 1];
            const updatedCandle = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              close: newPrice,
            };
            return [...prev.slice(0, -1), updatedCandle];
          }
        });
      } catch (err) {
        console.error("Failed to fetch price:", err);
      }
    };

    // Initial fetch
    fetchPrice();
    
    // Set up 20-second interval
    intervalRef.current = setInterval(fetchPrice, 20000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [coin.id]);

  // Calculate chart dimensions
  const allPrices = candleData.flatMap(c => [c.high, c.low]);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : currentPrice * 0.99;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : currentPrice * 1.01;
  const range = maxPrice - minPrice || 1;
  const padding = range * 0.1;
  const scaledMin = minPrice - padding;
  const scaledMax = maxPrice + padding;
  const scaledRange = scaledMax - scaledMin;

  const candleWidth = 80 / Math.max(candleData.length, 1);
  const gap = 2;

  const dailyChange = coin.price_change_percentage_24h ?? 0;

  return (
    <section className="price-chart-panel" aria-label={`${coin.name} price chart`}>
      <div className="price-chart-header">
        <div>
          <span>Live price chart (updates every 20s)</span>
          <h2>{coin.name}</h2>
          <p>{fullCurrency.format(scaledMin)} - {fullCurrency.format(scaledMax)}</p>
        </div>

        <label className="coin-selector">
          <span>Chosen coin</span>
          <select value={selectedCoinId} onChange={(e) => onSelectCoin(e.target.value)}>
            {coins.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="price-chart-body">
        <div className="chart-value">
          <strong>{fullCurrency.format(currentPrice)}</strong>
          <span className={dailyChange >= 0 ? "change-positive" : "change-negative"}>
            {dailyChange >= 0 ? "+" : ""}{dailyChange.toFixed(2)}%
          </span>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
          {candleData.map((candle, index) => {
            const x = 10 + index * (candleWidth + gap);
            const isGreen = candle.close >= candle.open;
            const color = isGreen ? "#72e4b9" : "#ef4444";
            
            const highY = 100 - ((candle.high - scaledMin) / scaledRange) * 100;
            const lowY = 100 - ((candle.low - scaledMin) / scaledRange) * 100;
            const openY = 100 - ((candle.open - scaledMin) / scaledRange) * 100;
            const closeY = 100 - ((candle.close - scaledMin) / scaledRange) * 100;
            
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
            
            return (
              <g key={index}>
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  y1={highY}
                  x2={x + candleWidth / 2}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="chart-actions">
        <button
          className="action-buy"
          onClick={() => {
            const amount = window.prompt(`Enter amount of ${coin.symbol} to buy:`, "0.1");
            if (!amount) return;
            const res = addTradeFromChart({ coinSymbol: coin.symbol, coinName: coin.name, type: "buy", price: currentPrice, amount });
            if (!res || !res.success) return alert(res?.message || "Could not complete buy");
            alert(`Bought ${amount} ${coin.symbol} at ${currentPrice}`);
          }}
        >Buy</button>

        <button
          className="action-sell"
          onClick={() => {
            const amount = window.prompt(`Enter amount of ${coin.symbol} to sell:`, "0.1");
            if (!amount) return;
            const res = addTradeFromChart({ coinSymbol: coin.symbol, coinName: coin.name, type: "sell", price: currentPrice, amount });
            if (!res || !res.success) return alert(res?.message || "Could not complete sell");
            alert(`Sold ${amount} ${coin.symbol} at ${currentPrice}`);
          }}
        >Sell</button>
      </div>
    </section>
  );
}

function CoinCard({ coin }) {
  return (
    <article className="coin-card">
      <div className="coin-card__top">
        <div className="coin-identity">
          <img src={coin.image} alt="" />
          <div>
            <h2>{coin.name}</h2>
            <span>{coin.symbol.toUpperCase()}</span>
          </div>
        </div>
        <span className="rank">#{coin.market_cap_rank}</span>
      </div>

      <div className="coin-price">
        <span>Price</span>
        <strong>{fullCurrency.format(coin.current_price)}</strong>
      </div>
    </article>
  );
}

export default Coins;
