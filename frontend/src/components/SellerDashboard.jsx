import React, { useState, useEffect, useRef } from 'react';
import { useSubscription } from '@apollo/client';
import { ORDER_SUBSCRIPTION } from '../queries';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [pincode, setPincode] = useState('');
  const [activePincode, setActivePincode] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const audioRef = useRef(null);

  // ========================================
  // GraphQL Subscription Hook
  // Only starts when activePincode is set
  // ========================================
  const { data, loading, error } = useSubscription(ORDER_SUBSCRIPTION, {
    variables: { pincode: activePincode },
    skip: !activePincode, // Don't subscribe until pincode is set
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('🔔 New order received:', subscriptionData.data);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
    },
  });

  // ========================================
  // Handle new orders from subscription
  // ========================================
  useEffect(() => {
    if (data?.newOrderArrived) {
      const newOrder = data.newOrderArrived;
      
      // Add to orders list
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      
      // Mark as new for animation
      setNewOrderIds(prev => new Set(prev).add(newOrder.id));
      
      // Remove "new" badge after 5 seconds
      setTimeout(() => {
        setNewOrderIds(prev => {
          const updated = new Set(prev);
          updated.delete(newOrder.id);
          return updated;
        });
      }, 5000);
    }
  }, [data]);

  // ========================================
  // Handle seller "login" - Set pincode
  // ========================================
  const handleSetPincode = (e) => {
    e.preventDefault();
    
    if (!pincode.trim()) {
      alert('Please enter a pincode');
      return;
    }
    
    // Clear previous orders when changing pincode
    setOrders([]);
    setNewOrderIds(new Set());
    setActivePincode(pincode.trim());
    
    console.log(`🏪 Seller dashboard activated for pincode: ${pincode}`);
  };

  // ========================================
  // Handle logout
  // ========================================
  const handleLogout = () => {
    setActivePincode(null);
    setPincode('');
    setOrders([]);
    setNewOrderIds(new Set());
  };

  // ========================================
  // Format date
  // ========================================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========================================
  // Render: Pincode Entry Form
  // ========================================
  if (!activePincode) {
    return (
      <div className="seller-dashboard">
        <div className="seller-login">
          <h2>🏪 Seller Dashboard</h2>
          <p className="subtitle">Enter your service pincode to start receiving orders</p>
          
          <form onSubmit={handleSetPincode} className="pincode-form">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter your pincode (e.g., 313001)"
              className="pincode-input"
              maxLength="6"
              pattern="[0-9]{6}"
            />
            <button type="submit" className="btn btn-primary">
              Start Listening 🔔
            </button>
          </form>
          
          <div className="info-card">
            <p>ℹ️ Once you enter your pincode, you'll receive real-time notifications for all orders in your service area.</p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // Render: Active Dashboard with Orders
  // ========================================
  return (
    <div className="seller-dashboard">
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiqD0fPTgjMGHm7A7+OZSA8PVqzn77BdGAg+ltryxnMlBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0pBSd9y/PajDkIGWe87eed" />

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="seller-info">
            <h2>🏪 Live Orders Dashboard</h2>
            <p className="pincode-badge">
              📍 Service Area: <strong>{activePincode}</strong>
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Change Pincode
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="status-bar">
        {loading && (
          <div className="status status-connecting">
            <span className="status-dot pulse"></span>
            Connecting to live orders...
          </div>
        )}
        {error && (
          <div className="status status-error">
            <span className="status-dot"></span>
            Connection error: {error.message}
          </div>
        )}
        {!loading && !error && (
          <div className="status status-connected">
            <span className="status-dot pulse"></span>
            🟢 Live - Listening for orders in pincode {activePincode}
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="orders-container">
        <div className="orders-header">
          <h3>Recent Orders ({orders.length})</h3>
          {orders.length === 0 && (
            <p className="no-orders">Waiting for orders...</p>
          )}
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${newOrderIds.has(order.id) ? 'new-order' : ''}`}
            >
              {/* New Order Badge */}
              {newOrderIds.has(order.id) && (
                <div className="new-badge">
                  🔔 NEW ORDER!
                </div>
              )}

              {/* Order Content */}
              <div className="order-content">
                <div className="order-header">
                  <h4 className="product-name">{order.productName}</h4>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">📍 Address:</span>
                    <span className="detail-value">{order.customerAddress}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📮 Pincode:</span>
                    <span className="detail-value">{order.pincode}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🕒 Time:</span>
                    <span className="detail-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🆔 Order ID:</span>
                    <span className="detail-value order-id">{order.id}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="btn btn-accept">✓ Accept</button>
                  <button className="btn btn-view">👁 View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {orders.length > 0 && (
        <div className="stats-footer">
          <div className="stat-card">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activePincode}</div>
            <div className="stat-label">Service Area</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;