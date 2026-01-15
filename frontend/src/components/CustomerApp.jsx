import React, { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, PLACE_ORDER } from '../queries';
import './CustomerApp.css';

const CustomerApp = () => {
  const [pincode, setPincode] = useState('');
  const [searchedPincode, setSearchedPincode] = useState(null);
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // ========================================
  // GraphQL Query - Lazy (triggered on demand)
  // ========================================
  const [getProducts, { loading, error, data }] = useLazyQuery(GET_PRODUCTS, {
    fetchPolicy: 'network-only',
  });

  // ========================================
  // GraphQL Mutation - Place Order
  // ========================================
  const [placeOrder, { loading: orderLoading }] = useMutation(PLACE_ORDER, {
    onCompleted: (data) => {
      console.log('✅ Order placed successfully:', data.placeOrder);
      setOrderSuccess(data.placeOrder);
      setShowOrderForm(false);
      setSelectedProduct(null);
      setCustomerAddress('');
      
      setTimeout(() => {
        setOrderSuccess(null);
      }, 5000);
    },
    onError: (error) => {
      console.error('❌ Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
    },
  });

  // ========================================
  // Handle Query Result
  // ========================================
  useEffect(() => {
    if (data?.getProductsByPincode) {
      console.log('✅ Products fetched:', data.getProductsByPincode);
      setSearchedPincode(pincode);
    }
  }, [data]);

  // ========================================
  // Handle Query Error
  // ========================================
  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching products:', error);
    }
  }, [error]);

  // ========================================
  // Handle Product Search
  // ========================================
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!pincode.trim()) {
      alert('Please enter a pincode');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    getProducts({
      variables: { pincode: pincode.trim() },
    });
  };

  // ========================================
  // Handle Buy Now - Show Order Form
  // ========================================
  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setShowOrderForm(true);
    setOrderSuccess(null);
  };

  // ========================================
  // Handle Place Order
  // ========================================
  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!customerAddress.trim()) {
      alert('Please enter your delivery address');
      return;
    }

    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    placeOrder({
      variables: {
        productName: selectedProduct.name,
        customerAddress: customerAddress.trim(),
        pincode: searchedPincode,
      },
    });
  };

  // ========================================
  // Handle Cancel Order Form
  // ========================================
  const handleCancelOrder = () => {
    setShowOrderForm(false);
    setSelectedProduct(null);
    setCustomerAddress('');
  };

  // ========================================
  // Format Price
  // ========================================
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // ========================================
  // Render: Main Customer View
  // ========================================
  return (
    <div className="customer-app">
      {/* Header */}
      <div className="customer-header">
        <h1>🛒 HyperLocal Marketplace</h1>
        <p className="tagline">Discover products from local sellers in your area</p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <span className="input-icon">📍</span>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter your pincode (e.g., 313001)"
              className="search-input"
              maxLength="6"
              pattern="[0-9]{6}"
            />
            <button 
              type="submit" 
              className="btn btn-search"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Products'}
            </button>
          </div>
        </form>

        {searchedPincode && (
          <div className="search-info">
            Showing results for pincode: <strong>{searchedPincode}</strong>
          </div>
        )}
      </div>

      {/* Order Success Message */}
      {orderSuccess && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon">✅</span>
            <div>
              <h3>Order Placed Successfully!</h3>
              <p>Order ID: {orderSuccess.id}</p>
              <p>Your order for <strong>{orderSuccess.productName}</strong> has been received.</p>
              <p className="success-note">The seller will be notified immediately! 🔔</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <div>
            <h3>Error Loading Products</h3>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding products in your area...</p>
        </div>
      )}

      {/* Products List */}
      {!loading && data?.getProductsByPincode && (
        <div className="products-container">
          {data.getProductsByPincode.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Products Available</h3>
              <p>Sorry, we don't have sellers serving pincode <strong>{searchedPincode}</strong> yet.</p>
              <p className="empty-tip">Try searching for a different pincode or check back later!</p>
            </div>
          ) : (
            <>
              <div className="products-header">
                <h2>Available Products ({data.getProductsByPincode.length})</h2>
              </div>
              
              <div className="products-grid">
                {data.getProductsByPincode.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <div className="image-placeholder">
                        {product.name.charAt(0)}
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">{formatPrice(product.price)}</p>
                      
                      <div className="seller-info">
                        <span className="seller-icon">🏪</span>
                        <div className="seller-details">
                          <p className="seller-name">{product.seller.name}</p>
                          <p className="seller-category">{product.seller.category}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyNow(product)}
                        className="btn btn-buy"
                        disabled={showOrderForm && selectedProduct?.id === product.id}
                      >
                        {showOrderForm && selectedProduct?.id === product.id
                          ? '✓ Selected'
                          : '🛒 Buy Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <div className="modal-overlay" onClick={handleCancelOrder}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCancelOrder}>
              ✕
            </button>

            <h2>Complete Your Order</h2>
            
            <div className="order-summary">
              <h3>{selectedProduct.name}</h3>
              <p className="order-price">{formatPrice(selectedProduct.price)}</p>
              <p className="order-seller">
                From: <strong>{selectedProduct.seller.name}</strong>
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="order-form">
              <div className="form-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  className="address-input"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Pincode</label>
                <input
                  type="text"
                  value={searchedPincode}
                  disabled
                  className="pincode-display"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="btn btn-cancel"
                  disabled={orderLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-confirm"
                  disabled={orderLoading}
                >
                  {orderLoading ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            </form>

            <p className="order-note">
              ℹ️ Your order will be sent to the seller immediately via real-time notification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApp;
