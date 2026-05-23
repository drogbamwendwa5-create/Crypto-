import { useEffect, useState, useContext } from "react";
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

const compactNumber = new Intl.NumberFormat("en-US", {
  compactDisplay: "short",
  maximumFractionDigits: 2,
  notation: "compact",
});

function Coins() {
  const [coins, setCoins] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true",
        );
        if (!response.ok) throw new Error(`Failed to fetch coins: ${response.status}`);
        const data = await response.json();
        setCoins(data);
        setSelectedCoinId(data[0]?.id ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
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
  const prices = coin.sparkline_in_7d?.price || [];
  const chartPrices = prices.length > 1 ? prices : [coin.current_price];
  const minPrice = Math.min(...chartPrices);
  const maxPrice = Math.max(...chartPrices);
  const range = maxPrice - minPrice || 1;
  const points = chartPrices.map((price, index) => {
    const x = (index / Math.max(chartPrices.length - 1, 1)) * 100;
    const y = 100 - ((price - minPrice) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  const dailyChange = coin.price_change_percentage_24h ?? 0;
  const { addTradeFromChart } = useContext(TradeWalletContext);

  return (
    <section className="price-chart-panel" aria-label={`${coin.name} price chart`}>
      <div className="price-chart-header">
        <div>
          <span>7 day price development</span>
          <h2>{coin.name}</h2>
          <p>{fullCurrency.format(minPrice)} - {fullCurrency.format(maxPrice)}</p>
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
          <strong>{fullCurrency.format(coin.current_price)}</strong>
          <span className={dailyChange >= 0 ? "change-positive" : "change-negative"}>
            {dailyChange >= 0 ? "+" : ""}{dailyChange.toFixed(2)}%
          </span>
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(114, 228, 185, 0.34)" />
              <stop offset="100%" stopColor="rgba(114, 228, 185, 0)" />
            </linearGradient>
          </defs>
          <polygon points={`0,100 ${points} 100,100`} fill="url(#chartFill)" />
          <polyline points={points} fill="none" stroke="#72e4b9" strokeWidth="2.5" />
        </svg>
      </div>

      <div className="chart-actions">
        <button
          className="action-buy"
          onClick={() => {
            const amount = window.prompt(`Enter amount of ${coin.symbol} to buy:`, "0.1");
            if (!amount) return;
            const res = addTradeFromChart({ coinSymbol: coin.symbol, coinName: coin.name, type: "buy", price: coin.current_price, amount });
            if (!res || !res.success) return alert(res?.message || "Could not complete buy");
            alert(`Bought ${amount} ${coin.symbol} at ${coin.current_price}`);
          }}
        >Buy</button>

        <button
          className="action-sell"
          onClick={() => {
            const amount = window.prompt(`Enter amount of ${coin.symbol} to sell:`, "0.1");
            if (!amount) return;
            const res = addTradeFromChart({ coinSymbol: coin.symbol, coinName: coin.name, type: "sell", price: coin.current_price, amount });
            if (!res || !res.success) return alert(res?.message || "Could not complete sell");
            alert(`Sold ${amount} ${coin.symbol} at ${coin.current_price}`);
          }}
        >Sell</button>
      </div>
    </section>
  );
}

function CoinCard({ coin }) {
  const dailyChange = coin.price_change_percentage_24h ?? 0;
  const changeClass = dailyChange >= 0 ? "change-positive" : "change-negative";

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
