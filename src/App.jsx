import { Routes, Route } from "react-router-dom";
import Coins from "./components/coins";
import Wallet from "./components/wallet";
import Trades from "./components/trades";
import Accounts from "./components/accounts";
import Navbar from "./components/navbar";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Coins />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/accounts" element={<Accounts />} />
      </Routes>
    </>
  );
}

export default App;
