import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('%cHyperLocal Marketplace', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('%cFrontend initialized successfully!', 'color: #48bb78; font-weight: bold;');
console.log('');
console.log('GraphQL Endpoints:');
console.log('  HTTP: http://localhost:4000/graphql');
console.log('  WebSocket: ws://localhost:4000/graphql');
console.log('');
console.log('Testing Instructions:');
console.log('  1. Open Seller Dashboard in one browser tab/window');
console.log('  2. Open Customer App in another tab/window');
console.log('  3. Set seller pincode (e.g., 313001)');
console.log('  4. Search and place order with same pincode');
console.log('  5. Watch real-time notification appear on Seller Dashboard!');
console.log('');
console.log('Features:');
console.log('  • Real-time GraphQL Subscriptions via WebSocket');
console.log('  • Pincode-based product filtering');
console.log('  • Split HTTP/WebSocket Apollo Client architecture');
console.log('  • Production-ready error handling');
