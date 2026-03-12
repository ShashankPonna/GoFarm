import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const items = useCartStore(state => state.items);

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" className="logo">GOFaRm</Link>
        {isAuthenticated && user?.customID && (
          <span style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: 'monospace',
            letterSpacing: '1px'
          }}>
            🆔 {user.customID}
          </span>
        )}
      </div>
      <div className="nav-links">
        <Link to="/products">Products</Link>
        <Link to="/crops">Crops</Link>
        <Link to="/community">Community</Link>
        {isAuthenticated ? (
          <>
            <Link to="/orders">Orders</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/cart">Cart ({items.length})</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
