import { Link } from "react-router-dom";
import { getRole, logout } from "../auth/auth";

function Navbar() {
  const role = getRole();

  return (
    <header className="header">
      <div className="logo">🛒 ServerlessMart</div>

      <nav className="nav-links">
        {/* Show Login only if NOT logged in */}
        {!role && <Link to="/login">Login</Link>}

        {/* User navigation */}
        {role === "USER" && <Link to="/home">Home</Link>}

        {/* Tenant navigation */}
        {role === "TENANT" && <Link to="/add-product">Add Product</Link>}
      </nav>

      {/* Logout button */}
      {role && (
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      )}
    </header>
  );
}

export default Navbar;