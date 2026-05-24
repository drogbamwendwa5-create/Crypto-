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
  const [candleData, setCandleData] = useState([]);
  const [candleLoading, setCandleLoading] = useState(false);
  const [candleError, setCandleError] = useState(null);
  const [chartDurationDays, setChartDurationDays] = useState(1);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(60000);
  const apiKey = import.meta.env.VITE_CRYPTO_API_KEY || "";
  const [provider, setProvider] = useState(apiKey ? "cryptocompare" : "coingecko");

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

  useEffect(() => {
    let cancelled = false;
    const symbol = selectedCoinId ? coins.find((c) => c.id === selectedCoinId)?.symbol?.toUpperCase() : "";

    const fetchCandles = async () => {
      if (!selectedCoinId) return;

      setCandleError(null);
      setCandleLoading(true);

      try {
        let candles = [];

        if (provider === "cryptocompare" && apiKey && symbol) {
          const response = await fetch(
            `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${symbol}&tsym=USD&limit=79&api_key=${apiKey}`,
          );
          const data = await response.json();
          if (data.Response !== "Success") throw new Error(data.Message || "CryptoCompare API error");
          candles = data.Data.Data.map((item) => ({
            time: item.time * 1000,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));
        } else {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${selectedCoinId}/ohlc?vs_currency=usd&days=${chartDurationDays}`,
          );
          if (!response.ok) throw new Error(`Failed to fetch OHLC: ${response.status}`);
          const data = await response.json();
          candles = data.map(([time, open, high, low, close]) => ({
            time,
            open,
            high,
            low,
            close,
          }));
        }

        if (!cancelled) {
          setCandleData(candles.slice(-60));
        }
      } catch (err) {
        if (!cancelled) {
          setCandleError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setCandleLoading(false);
        }
      }
    };

    fetchCandles();
    const intervalId = window.setInterval(fetchCandles, refreshIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedCoinId, provider, apiKey, refreshIntervalMs, chartDurationDays, coins]);

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
          candles={candleData}
          candleLoading={candleLoading}
          candleError={candleError}
          refreshIntervalMs={refreshIntervalMs}
          setRefreshIntervalMs={setRefreshIntervalMs}
          chartDurationDays={chartDurationDays}
          setChartDurationDays={setChartDurationDays}
          provider={provider}
          setProvider={setProvider}
          hasApiKey={Boolean(apiKey)}
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

function PriceChart({
  coin,
  coins,
  onSelectCoin,
  selectedCoinId,
  candles,
  candleLoading,
  candleError,
  refreshIntervalMs,
  setRefreshIntervalMs,
  chartDurationDays,
  setChartDurationDays,
  provider,
  setProvider,
  hasApiKey,
}) {
  const { addTradeFromChart } = useContext(TradeWalletContext);
  const latestClose = candles.length ? candles[candles.length - 1].close : coin.current_price;
  const dailyChange = coin.price_change_percentage_24h ?? 0;
  const minPrice = Math.min(...candles.map((item) => item.low), coin.current_price);
  const maxPrice = Math.max(...candles.map((item) => item.high), coin.current_price);

  return (
    <section className="price-chart-panel" aria-label={`${coin.name} price chart`}>
      <div className="price-chart-header">
        <div>
          <span>Price candles</span>
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

        <div className="chart-settings">
          <label className="chart-select">
            <span>Auto refresh</span>
            <select value={refreshIntervalMs} onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}>
              <option value={15000}>15 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </label>
          <label className="chart-select">
            <span>Time window</span>
            <select value={chartDurationDays} onChange={(e) => setChartDurationDays(Number(e.target.value))}>
              <option value={1}>1 day</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </label>
          {hasApiKey && (
            <label className="chart-select">
              <span>Data provider</span>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="coingecko">CoinGecko</option>
                <option value="cryptocompare">CryptoCompare</option>
              </select>
            </label>
          )}
        </div>
      </div>

      <div className="price-chart-body">
        <div className="chart-value">
          <strong>{fullCurrency.format(latestClose)}</strong>
          <span className={dailyChange >= 0 ? "change-positive" : "change-negative"}>
            {dailyChange >= 0 ? "+" : ""}{dailyChange.toFixed(2)}%
          </span>
        </div>

        <div className="candle-chart-wrapper">
          {candleLoading ? (
            <div className="chart-loading">Loading candlesticks...</div>
          ) : candleError ? (
            <div className="chart-loading chart-loading--error">{candleError}</div>
          ) : (
            <CandlestickChart candles={candles} />
          )}
        </div>
      </div>

      <div className="chart-actions">
        <button
          className="action-buy"
          onClick={() => {
            const amount = window.prompt(`Enter amount of ${coin.symbol} to buy:`, "0.1");
            if (!amount) return;
            const res = addTradeFromChart({ coinSymbol: coin.symbol, coinName: coin.name, type: "buy", price: latestClose, amount });
            if (!res || !res.success) return alert(res?.message || "Could not complete buy");
            alert(`Bought ${amount} ${coin.symbol} at ${latestClose}`);
          }}
        >Buy</button>

        <button
          className="action-sell"
          onClick={() => {
            const amount = window.prompt(`Enter amount of ${coin.symbol} to sell:`, "0.1");
            if (!amount) return;
            const res = addTradeFromChart({ coinSymbol: coin.symbol, coinName: coin.name, type: "sell", price: latestClose, amount });
            if (!res || !res.success) return alert(res?.message || "Could not complete sell");
            alert(`Sold ${amount} ${coin.symbol} at ${latestClose}`);
          }}
        >Sell</button>
      </div>
    </section>
  );
}

function CandlestickChart({ candles }) {
  const display = candles.slice(-40);

  if (!display.length) {
    return <div className="chart-empty">No candlestick data available yet.</div>;
  }

  const allValues = display.flatMap((c) => [c.open, c.high, c.low, c.close]);
  const minPrice = Math.min(...allValues);
  const maxPrice = Math.max(...allValues);
  const range = Math.max(maxPrice - minPrice, 1);
  const barWidth = 100 / display.length;

  const yPos = (value) => 100 - ((value - minPrice) / range) * 100;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Candlestick chart">
      <g opacity="0.18">
        <line x1="0" y1="10" x2="100" y2="10" stroke="#666" strokeWidth="0.2" />
        <line x1="0" y1="30" x2="100" y2="30" stroke="#666" strokeWidth="0.2" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#666" strokeWidth="0.2" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="#666" strokeWidth="0.2" />
        <line x1="0" y1="90" x2="100" y2="90" stroke="#666" strokeWidth="0.2" />
      </g>

      {display.map((candle, index) => {
        const xCenter = index * barWidth + barWidth * 0.5;
        const wickTop = yPos(candle.high);
        const wickBottom = yPos(candle.low);
        const openY = yPos(candle.open);
        const closeY = yPos(candle.close);
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(openY - closeY));
        const color = candle.close >= candle.open ? "#4ecb71" : "#ff4d6d";

        return (
          <g key={candle.time}>
            <line x1={xCenter} y1={wickTop} x2={xCenter} y2={wickBottom} stroke={color} strokeWidth="0.6" />
            <rect
              x={xCenter - barWidth * 0.25}
              y={bodyTop}
              width={barWidth * 0.5}
              height={bodyHeight}
              fill={color}
              rx="0.5"
              ry="0.5"
            />
          </g>
        );
      })}
    </svg>
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
