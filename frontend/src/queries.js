import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProductsByPincode($pincode: String!) {
    getProductsByPincode(pincode: $pincode) {
      id
      name
      price
      seller {
        id
        name
        pincode
        category
      }
      createdAt
    }
  }
`;

export const PLACE_ORDER = gql`
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
      productName
      customerAddress
      pincode
      status
      createdAt
    }
  }
`;

export const ORDER_SUBSCRIPTION = gql`
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
`;

export const GET_ALL_SELLERS = gql`
  query GetAllSellers {
    getAllSellers {
      id
      name
      pincode
      category
      createdAt
    }
  }
`;

export const GET_ORDERS_BY_PINCODE = gql`
  query GetOrdersByPincode($pincode: String!) {
    getOrdersByPincode(pincode: $pincode) {
      id
      productName
      customerAddress
      pincode
      status
      createdAt
    }
  }
`;
