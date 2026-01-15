# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HYPERLOCAL MARKETPLACE                            │
│                     Modular Monolith Architecture                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐         ┌─────────────────┐                        │
│  │  Customer App   │         │   Seller App    │                        │
│  │                 │         │                 │                        │
│  │  • Browse       │         │  • Dashboard    │                        │
│  │  • Order        │         │  • Real-Time    │                        │
│  └────────┬────────┘         └────────┬────────┘                        │
│           │                           │                                  │
│           │ HTTP (Query/Mutation)     │ WebSocket (Subscription)        │
│           │                           │                                  │
└───────────┼───────────────────────────┼──────────────────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                                  │
│                    (Single Port: 4000)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │              HYBRID SERVER (index.js)                       │         │
│  │  ┌──────────────────────┐  ┌──────────────────────┐       │         │
│  │  │  Express HTTP        │  │  WebSocket Server    │       │         │
│  │  │  • Query             │  │  • Subscription      │       │         │
│  │  │  • Mutation          │  │  • Real-Time Push    │       │         │
│  │  └──────────┬───────────┘  └──────────┬───────────┘       │         │
│  └─────────────┼──────────────────────────┼───────────────────┘         │
│                │                          │                              │
│                └──────────┬───────────────┘                              │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │            APOLLO SERVER (@apollo/server)                  │         │
│  │  • GraphQL Schema Parsing                                 │         │
│  │  • Request Validation                                     │         │
│  │  • Error Handling                                         │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                                │
│                      (graphql/resolvers.js)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐          │
│  │   QUERIES    │      │  MUTATIONS   │      │ SUBSCRIPTION │          │
│  │              │      │              │      │              │          │
│  │ • getProducts│      │• registerSeller     │• newOrderArrived        │
│  │   ByPincode  │      │• addProduct  │      │  (with Filter)│          │
│  │ • getAllSellers     │• placeOrder  │◄─────┤              │          │
│  │ • getOrders  │      │  (triggers   │      │  PubSub      │          │
│  │   ByPincode  │      │   PubSub)    │      │  + Filter    │          │
│  └──────┬───────┘      └──────┬───────┘      └──────────────┘          │
│         │                     │                                          │
│         │   Core Business Logic:                                        │
│         │   1. Pincode-based filtering                                  │
│         │   2. Serviceability checks                                    │
│         │   3. Real-time event publishing                               │
│         │   4. Subscription filtering (CRITICAL)                        │
│         │                     │                                          │
└─────────┼─────────────────────┼──────────────────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA ACCESS LAYER                                │
│                         (models/*.js)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐          │
│  │ Seller.js    │      │ Product.js   │      │ Order.js     │          │
│  │              │      │              │      │              │          │
│  │ • name       │◄─────│ • seller (ref)      │ • productName│          │
│  │ • pincode    │      │ • name       │      │ • pincode    │          │
│  │   (indexed)  │      │ • price      │      │   (indexed)  │          │
│  │ • category   │      │              │      │ • status     │          │
│  └──────┬───────┘      └──────────────┘      └──────────────┘          │
│         │                                                                │
│         │              Mongoose ODM                                     │
│         │                                                                │
└─────────┼────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                    │
│                        MongoDB                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ sellers        │  │ products       │  │ orders         │            │
│  │ Collection     │  │ Collection     │  │ Collection     │            │
│  │                │  │                │  │                │            │
│  │ Index: pincode │  │ Index: seller  │  │ Index: pincode │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME FLOW (CRITICAL)                             │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Seller Connects
─────────────────────────
Seller → WebSocket → Subscribe(pincode: "313001")
                  └─► Listening for events...

Step 2: Customer Places Order
──────────────────────────────
Customer → HTTP POST → placeOrder(pincode: "313001")
                    ├─► Create Order in DB
                    └─► PubSub.publish("NEW_ORDER", order)

Step 3: Subscription Filter (CORE LOGIC)
─────────────────────────────────────────
PubSub → Check all active subscriptions
      └─► For each subscription:
          if (order.pincode === subscription.pincode) {
            ✅ Send notification to seller
          } else {
            ❌ Filter out (don't send)
          }

Step 4: Seller Receives Real-Time Alert
────────────────────────────────────────
Seller's WebSocket ← Order notification
                  └─► Update UI immediately


┌─────────────────────────────────────────────────────────────────────────┐
│                      KEY DESIGN DECISIONS                                │
└─────────────────────────────────────────────────────────────────────────┘

1. SINGLE PORT ARCHITECTURE
   ✓ HTTP and WebSocket on same port (4000)
   ✓ Simplified deployment
   ✓ No CORS issues between protocols

2. PINCODE-BASED FILTERING
   ✓ Indexed pincode field in Seller/Order
   ✓ O(log n) query performance
   ✓ Scalable to millions of pincodes

3. SUBSCRIPTION FILTERING
   ✓ Filter at resolver level (not DB)
   ✓ Memory efficient
   ✓ Real-time with minimal latency

4. MODULAR MONOLITH
   ✓ Easy to understand and maintain
   ✓ Can split into microservices later
   ✓ Shared types and business logic

5. CLEAN ARCHITECTURE
   ✓ Separation of concerns
   ✓ Testable business logic
   ✓ Database-agnostic resolvers


┌─────────────────────────────────────────────────────────────────────────┐
│                     SCALING CONSIDERATIONS                               │
└─────────────────────────────────────────────────────────────────────────┘

Current Setup (MVP):
• Single server instance
• In-memory PubSub
• Suitable for: 1k-10k concurrent users

Next Steps for Scale:
1. Replace in-memory PubSub with Redis PubSub
2. Add horizontal scaling with load balancer
3. Implement sticky sessions for WebSocket
4. Add caching layer (Redis) for products
5. Consider splitting into microservices if needed

Redis PubSub Integration (for horizontal scaling):
┌────────────┐     ┌────────────┐     ┌────────────┐
│ Server 1   │────►│   Redis    │◄────│ Server 2   │
│ (WebSocket)│     │  PubSub    │     │ (WebSocket)│
└────────────┘     └────────────┘     └────────────┘
     │                                       │
     └───────────► Load Balancer ◄───────────┘
```