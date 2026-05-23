import { Routes, Route } from "react-router-dom";
import Coins from "./components/coins";
import Wallet from "./components/wallet";
import Trades from "./components/trades";
import Accounts from "./components/accounts";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Coins />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
