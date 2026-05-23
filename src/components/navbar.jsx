import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">₿</span>
        <span className="navbar-title">CryptoTrade</span>
      </div>
      
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Market
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Wallet
        </NavLink>
        <NavLink to="/trades" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          Trades
        </NavLink>
        <NavLink to="/deposit" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Deposit
        </NavLink>
        <NavLink to="/accounts" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Accounts
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
