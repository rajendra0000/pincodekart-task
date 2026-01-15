import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './client';
import CustomerApp from './components/CustomerApp';
import SellerDashboard from './components/SellerDashboard';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('customer');

  return (
    <ApolloProvider client={client}>
      <div className="app-container">
        {/* Navigation Bar */}
        <nav className="app-nav">
          <div className="nav-content">
            <div className="nav-brand">
              <h1>🏪 HyperLocal Marketplace</h1>
              <p className="nav-subtitle">Pincode-Based Shopping with Real-Time Updates</p>
            </div>
            
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeView === 'customer' ? 'active' : ''}`}
                onClick={() => setActiveView('customer')}
              >
                <span className="tab-icon">🛒</span>
                <span className="tab-label">Customer</span>
              </button>
              <button
                className={`nav-tab ${activeView === 'seller' ? 'active' : ''}`}
                onClick={() => setActiveView('seller')}
              >
                <span className="tab-icon">📦</span>
                <span className="tab-label">Seller</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="app-main">
          <div className="view-container">
            {activeView === 'customer' ? (
              <CustomerApp />
            ) : (
              <SellerDashboard />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <p>
              <strong>Testing Tip:</strong> Open this page in two browser windows. 
              Use <strong>Seller view</strong> in one window and <strong>Customer view</strong> in another 
              to see real-time order notifications! 🚀
            </p>
            <p className="footer-tech">
              Built with React + Apollo Client + GraphQL Subscriptions (WebSocket)
            </p>
          </div>
        </footer>

        {/* Connection Status Indicator */}
        <div className="connection-indicator">
          <div className="indicator-dot"></div>
          <span className="indicator-text">Connected</span>
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;