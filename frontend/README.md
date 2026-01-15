# HyperLocal Marketplace - Frontend

A production-ready React frontend for the HyperLocal Marketplace with real-time GraphQL subscriptions over WebSocket.

## 🎯 Features

✅ **Split Apollo Client Architecture** - Separate HTTP and WebSocket links for optimal performance  
✅ **Real-Time Order Notifications** - Sellers receive instant alerts via GraphQL Subscriptions  
✅ **Pincode-Based Product Discovery** - Customers only see products from their area  
✅ **Filtered Subscriptions** - Sellers only receive orders for their specific pincode  
✅ **Modern React** - Built with React 18, Vite, and functional components  
✅ **Clean UI/UX** - Pure CSS with responsive design and animations  
✅ **Production-Ready** - Error handling, loading states, and optimized builds  

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:4000`

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Verify Backend Connection
Make sure the backend GraphQL server is running at:
- HTTP: `http://localhost:4000/graphql`
- WebSocket: `ws://localhost:4000/graphql`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CustomerApp.jsx       # Customer shopping interface
│   │   ├── CustomerApp.css       # Customer app styles
│   │   ├── SellerDashboard.jsx   # Seller real-time dashboard
│   │   └── SellerDashboard.css   # Seller dashboard styles
│   ├── client.js                 # Apollo Client configuration (CRITICAL)
│   ├── queries.js                # GraphQL operations
│   ├── App.jsx                   # Main app with view switching
│   ├── App.css                   # Main app styles
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles & reset
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
└── package.json                  # Dependencies
```

## 🔌 Apollo Client Architecture (CRITICAL)

The Apollo Client uses a **split link** architecture to handle different transport protocols:

```javascript
// client.js
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,      // WebSocket for subscriptions
  httpLink     // HTTP for queries/mutations
);
```

### Why This Matters:
- **Queries & Mutations** → HTTP (REST-like, stateless)
- **Subscriptions** → WebSocket (persistent connection, real-time)
- **Single Client** → Automatically routes requests to the correct transport

## 📊 GraphQL Operations

### Queries
```graphql
# Get products by pincode
query GetProductsByPincode($pincode: String!) {
  getProductsByPincode(pincode: $pincode) {
    id
    name
    price
    seller {
      name
      pincode
    }
  }
}
```

### Mutations
```graphql
# Place an order (triggers real-time notification)
mutation PlaceOrder(
  $productName: String!
  $customerAddress: String!
  $pincode: String!
) {
  placeOrder(
    productName: $productName
    customerAddress: $customerAddress
    pincode: $pincode
  ) {
    id
    status
    createdAt
  }
}
```

### Subscriptions
```graphql
# Listen for new orders (seller side)
subscription NewOrderArrived($pincode: String!) {
  newOrderArrived(pincode: $pincode) {
    id
    productName
    customerAddress
    pincode
    status
    createdAt
  }
}
```

## 🧪 Testing Real-Time Features

### Method 1: Two Browser Windows

**Window 1 - Seller Dashboard:**
1. Open `http://localhost:3000`
2. Click "Seller" tab
3. Enter pincode: `313001`
4. Click "Start Listening"
5. Keep this window visible

**Window 2 - Customer App:**
1. Open `http://localhost:3000` in new window
2. Click "Customer" tab
3. Enter pincode: `313001`
4. Click "Search Products"
5. Click "Buy Now" on any product
6. Fill in address and click "Confirm Order"

**Expected Result:**
- Window 1 (Seller) receives real-time notification with animation and sound
- Order appears at the top of the list with "NEW ORDER!" badge

### Method 2: Multiple Pincodes

**Test pincode filtering:**
1. Open two seller dashboards (two tabs)
2. Tab 1: Set pincode `313001`
3. Tab 2: Set pincode `110001`
4. Place order for `313001` in customer view
5. **Only Tab 1 should receive the notification**
6. Place order for `110001`
7. **Only Tab 2 should receive the notification**

This proves the subscription filtering works correctly!

## 🎨 UI Components

### Customer App
- **Search Section:** Pincode-based product discovery
- **Products Grid:** Responsive card layout
- **Order Modal:** Complete order form with validation
- **Success Notifications:** Animated order confirmations

### Seller Dashboard
- **Login Screen:** Pincode entry for sellers
- **Live Dashboard:** Real-time order feed
- **Order Cards:** Detailed order information with actions
- **New Order Animations:** Visual and audio notifications
- **Stats Footer:** Order statistics

## 🔧 Configuration

### Backend Endpoints (client.js)
```javascript
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
  })
);
```

### Change Ports
If your backend runs on a different port, update `client.js`:
```javascript
uri: 'http://localhost:YOUR_PORT/graphql'
url: 'ws://localhost:YOUR_PORT/graphql'
```

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

### Deployment Checklist:
1. Update backend URLs in `client.js` to production endpoints
2. Configure CORS on backend to allow your frontend domain
3. Enable HTTPS for both HTTP and WSS (WebSocket Secure)
4. Add environment variables for API endpoints
5. Test WebSocket connections work through your hosting provider

## 🚨 Troubleshooting

### WebSocket Connection Failed
```
Error: WebSocket connection to 'ws://localhost:4000/graphql' failed
```
**Solution:** Ensure backend server is running and WebSocket endpoint is accessible.

### No Products Found
```
Empty array returned from getProductsByPincode
```
**Solution:** 
1. Verify sellers exist for that pincode in backend
2. Check products are linked to those sellers
3. Use backend testing guide to seed data

### Subscription Not Receiving Orders
**Solution:**
1. Check browser console for WebSocket connection status
2. Verify pincode in subscription matches order pincode exactly
3. Check backend logs for subscription events
4. Ensure firewall isn't blocking WebSocket connections

### CORS Errors
```
Access to fetch at 'http://localhost:4000/graphql' blocked by CORS
```
**Solution:** Backend needs to allow your frontend origin in CORS configuration.

## 🎓 Key Learning Points

### Apollo Client Split Architecture
- Automatically routes operations based on type
- Single client instance for entire app
- Efficient connection management

### React Hooks Usage
- `useLazyQuery` - Triggered on user action (search)
- `useMutation` - Triggered on user action (place order)
- `useSubscription` - Continuous connection (real-time updates)

### State Management
- Local state for UI interactions
- Apollo cache for GraphQL data
- No Redux needed for this use case

### Real-Time Patterns
- WebSocket connection lifecycle
- Subscription filtering at resolver level
- Visual feedback for real-time events

## 🔐 Production Considerations

1. **Authentication:**
   - Add JWT tokens to WebSocket connection params
   - Protect seller dashboard routes
   - Validate user permissions

2. **Error Handling:**
   - Global error boundary
   - Retry logic for failed connections
   - User-friendly error messages

3. **Performance:**
   - Code splitting with lazy loading
   - Image optimization
   - Bundle size optimization (already configured)

4. **Security:**
   - Input validation and sanitization
   - XSS protection
   - Secure WebSocket (WSS) in production

5. **Monitoring:**
   - WebSocket connection health
   - Query performance metrics
   - Error tracking (Sentry, etc.)

## 📚 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM rendering
- `@apollo/client` - GraphQL client
- `graphql` - GraphQL language
- `graphql-ws` - WebSocket subscriptions

### Development
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - Vite React plugin

## 🤝 Integration with Backend

This frontend is designed to work seamlessly with the Node.js/GraphQL backend:
- Matches exact schema field names
- Uses correct variable types
- Implements proper subscription filtering
- Handles all backend error responses

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using React + Apollo Client + GraphQL Subscriptions

---

**Need Help?** Check the browser console for detailed logs and error messages! 🚀