# HyperLocal Marketplace Backend

A production-ready Node.js backend implementing a **Modular Monolith** architecture for a pincode-based marketplace with real-time order notifications using GraphQL Subscriptions.

## 🏗️ Architecture

**Pattern:** Modular Monolith with Clean Architecture
- **Models Layer:** Mongoose schemas and database logic
- **GraphQL Layer:** TypeDefs and Resolvers
- **Server Layer:** Express + Apollo Server + WebSocket

## 🚀 Features

✅ **Pincode-Based Serviceability:** Customers only see products from sellers serving their pincode  
✅ **Real-Time Notifications:** Sellers receive instant alerts via GraphQL Subscriptions  
✅ **Filtered Subscriptions:** Sellers only receive orders for their specific pincode  
✅ **Hybrid Server:** Single port for both HTTP (Query/Mutation) and WebSocket (Subscription)  
✅ **Production-Ready:** Error handling, logging, graceful shutdown, health checks  

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

3. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

4. **Run the server:**
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server will start on `http://localhost:4000`

## 📡 API Endpoints

- **GraphQL HTTP:** `http://localhost:4000/graphql`
- **GraphQL WebSocket:** `ws://localhost:4000/graphql`
- **Health Check:** `http://localhost:4000/health`

## 🔍 GraphQL Operations

### **Queries**

#### 1. Get Products by Pincode
```graphql
query GetProducts {
  getProductsByPincode(pincode: "313001") {
    id
    name
    price
    seller {
      id
      name
      pincode
      category
    }
  }
}
```

#### 2. Get All Sellers (Admin)
```graphql
query GetSellers {
  getAllSellers {
    id
    name
    pincode
    category
    createdAt
  }
}
```

#### 3. Get Orders by Pincode (Seller Dashboard)
```graphql
query GetOrders {
  getOrdersByPincode(pincode: "313001") {
    id
    productName
    customerAddress
    pincode
    status
    createdAt
  }
}
```

### **Mutations**

#### 1. Register a Seller
```graphql
mutation RegisterSeller {
  registerSeller(
    name: "Rajesh Store"
    pincode: "313001"
    category: "Groceries"
  ) {
    id
    name
    pincode
    category
  }
}
```

#### 2. Add a Product
```graphql
mutation AddProduct {
  addProduct(
    name: "Fresh Apples"
    price: 120
    sellerId: "YOUR_SELLER_ID_HERE"
  ) {
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

#### 3. Place an Order (Triggers Real-Time Alert)
```graphql
mutation PlaceOrder {
  placeOrder(
    productName: "Fresh Apples"
    customerAddress: "123 Main St, Udaipur"
    pincode: "313001"
  ) {
    id
    productName
    customerAddress
    pincode
    status
    createdAt
  }
}
```

### **Subscriptions** 🔔

#### Subscribe to New Orders (Seller Side)
```graphql
subscription ListenToOrders {
  newOrderArrived(pincode: "313001") {
    id
    productName
    customerAddress
    pincode
    status
    createdAt
  }
}
```

**Important:** Each seller subscribes with their own pincode. They will ONLY receive orders for their specific pincode.

## 🧪 Testing the Real-Time Flow

### Step 1: Register Sellers for Different Pincodes
```graphql
# Seller 1 - Udaipur
mutation {
  registerSeller(name: "Udaipur Store", pincode: "313001", category: "Groceries") {
    id
    name
    pincode
  }
}

# Seller 2 - Delhi
mutation {
  registerSeller(name: "Delhi Store", pincode: "110001", category: "Groceries") {
    id
    name
    pincode
  }
}
```

### Step 2: Add Products
```graphql
mutation {
  addProduct(name: "Apples", price: 100, sellerId: "UDAIPUR_SELLER_ID") {
    id
    name
  }
}
```

### Step 3: Open Two Subscription Connections

**Tab 1 - Udaipur Seller (313001):**
```graphql
subscription {
  newOrderArrived(pincode: "313001") {
    id
    productName
    pincode
  }
}
```

**Tab 2 - Delhi Seller (110001):**
```graphql
subscription {
  newOrderArrived(pincode: "110001") {
    id
    productName
    pincode
  }
}
```

### Step 4: Place Orders

**Order for Udaipur:**
```graphql
mutation {
  placeOrder(productName: "Apples", customerAddress: "123 St", pincode: "313001") {
    id
  }
}
```
✅ **Result:** Only Tab 1 (Udaipur seller) receives the notification

**Order for Delhi:**
```graphql
mutation {
  placeOrder(productName: "Bananas", customerAddress: "456 Ave", pincode: "110001") {
    id
  }
}
```
✅ **Result:** Only Tab 2 (Delhi seller) receives the notification

## 🏛️ Database Schema

### Seller Collection
```javascript
{
  name: String,
  pincode: String (indexed),
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```javascript
{
  name: String,
  price: Number,
  seller: ObjectId (ref: Seller, indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  productName: String,
  customerAddress: String,
  pincode: String (indexed),
  status: String (default: 'PENDING'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Production Considerations

1. **Authentication:**
   - Add JWT authentication to context
   - Protect mutations with auth middleware
   - Validate seller ownership for subscriptions

2. **Rate Limiting:**
   - Implement rate limiting for mutations
   - Add subscription connection limits per user

3. **Database:**
   - Use MongoDB Atlas for production
   - Enable replica sets for transactions
   - Set up proper indexes (already configured)

4. **Monitoring:**
   - Add logging service (Winston, Pino)
   - Set up error tracking (Sentry)
   - Monitor WebSocket connections

5. **CORS:**
   - Configure allowed origins properly
   - Update CORS settings in `index.js`

6. **Environment Variables:**
   - Never commit `.env` file
   - Use secrets management in production

## 📊 Performance Optimizations

✅ **Database Indexes:** Pincode and seller fields are indexed  
✅ **Connection Pooling:** Mongoose handles connection pooling  
✅ **Graceful Shutdown:** Proper cleanup of HTTP and WebSocket servers  
✅ **Error Handling:** Comprehensive try-catch blocks with GraphQLError  

## 🐛 Debugging

Enable detailed logs:
```javascript
// In index.js, uncomment debug logs
mongoose.set('debug', true);
```

Check WebSocket connections:
```bash
# View console logs for:
# 🔌 WebSocket client connected
# 🔔 Real-time notification sent for pincode XXX
# ✅ Delivering order to seller at pincode XXX
```

## 📝 Project Structure



## 🤝 Contributing

This is a production-ready MVP. For enhancements:
1. Add authentication layer
2. Implement order status updates
3. Add seller ratings and reviews
4. Implement payment integration
5. Add admin dashboard

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using Node.js, Express, Apollo Server, and MongoDB

---

**Need Help?** Check the console logs - they're detailed and helpful! 🚀