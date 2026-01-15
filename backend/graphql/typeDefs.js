const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Seller {
    id: ID!
    name: String!
    pincode: String!
    category: String!
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String!
    price: Int!
    seller: Seller!
    createdAt: String
    updatedAt: String
  }

  type Order {
    id: ID!
    productName: String!
    customerAddress: String!
    pincode: String!
    status: String!
    createdAt: String!
  }

  type Query {
    getProductsByPincode(pincode: String!): [Product!]!
    getAllSellers: [Seller!]!
    getOrdersByPincode(pincode: String!): [Order!]!
  }

  type Mutation {
    registerSeller(
      name: String!
      pincode: String!
      category: String!
    ): Seller!

    addProduct(
      name: String!
      price: Int!
      sellerId: ID!
    ): Product!

    placeOrder(
      productName: String!
      customerAddress: String!
      pincode: String!
    ): Order!
  }

  type Subscription {
    newOrderArrived(pincode: String!): Order!
  }
`;

module.exports = typeDefs;
