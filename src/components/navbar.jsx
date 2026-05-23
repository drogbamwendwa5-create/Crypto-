import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
        Market
      </NavLink>
      <NavLink to="/wallet" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
        Wallet
      </NavLink>
      <NavLink to="/trades" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
        Trades
      </NavLink>
    </nav>
  );
}

export default Navbar;
