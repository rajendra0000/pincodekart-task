const { PubSub } = require('graphql-subscriptions');
const { GraphQLError } = require('graphql');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');

const pubsub = new PubSub();
const NEW_ORDER_EVENT = 'NEW_ORDER';

const resolvers = {
  Query: {
    getProductsByPincode: async (_, { pincode }) => {
      try {
        if (!pincode || pincode.trim().length === 0) {
          throw new GraphQLError('Pincode is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const sellers = await Seller.find({ pincode: pincode.trim() });

        if (sellers.length === 0) {
          return [];
        }

        const sellerIds = sellers.map(seller => seller._id);

        const products = await Product.find({
          seller: { $in: sellerIds }
        }).populate('seller');

        return products;
      } catch (error) {
        console.error('Error in getProductsByPincode:', error);
        throw new GraphQLError('Failed to fetch products', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error.message
          }
        });
      }
    },

    getAllSellers: async () => {
      try {
        const sellers = await Seller.find({}).sort({ createdAt: -1 });
        return sellers;
      } catch (error) {
        console.error('Error in getAllSellers:', error);
        throw new GraphQLError('Failed to fetch sellers', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error.message
          }
        });
      }
    },

    getOrdersByPincode: async (_, { pincode }) => {
      try {
        if (!pincode || pincode.trim().length === 0) {
          throw new GraphQLError('Pincode is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const orders = await Order.find({
          pincode: pincode.trim()
        }).sort({ createdAt: -1 });

        return orders;
      } catch (error) {
        console.error('Error in getOrdersByPincode:', error);
        throw new GraphQLError('Failed to fetch orders', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error.message
          }
        });
      }
    }
  },

  Mutation: {
    registerSeller: async (_, { name, pincode, category }) => {
      try {
        if (!name || name.trim().length === 0) {
          throw new GraphQLError('Seller name is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (!pincode || pincode.trim().length === 0) {
          throw new GraphQLError('Pincode is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (!category || category.trim().length === 0) {
          throw new GraphQLError('Category is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const seller = new Seller({
          name: name.trim(),
          pincode: pincode.trim(),
          category: category.trim()
        });

        await seller.save();

        console.log(`New seller registered: ${seller.name} for pincode ${seller.pincode}`);

        return seller;
      } catch (error) {
        console.error('Error in registerSeller:', error);
        throw new GraphQLError('Failed to register seller', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error.message
          }
        });
      }
    },

    addProduct: async (_, { name, price, sellerId }) => {
      try {
        if (!name || name.trim().length === 0) {
          throw new GraphQLError('Product name is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (price < 0) {
          throw new GraphQLError('Price cannot be negative', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (!sellerId) {
          throw new GraphQLError('Seller ID is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const seller = await Seller.findById(sellerId);
        if (!seller) {
          throw new GraphQLError('Seller not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const product = new Product({
          name: name.trim(),
          price,
          seller: sellerId
        });

        await product.save();
        await product.populate('seller');

        console.log(`New product added: ${product.name} by seller ${seller.name}`);

        return product;
      } catch (error) {
        console.error('Error in addProduct:', error);
        throw new GraphQLError('Failed to add product', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error.message
          }
        });
      }
    },

    placeOrder: async (_, { productName, customerAddress, pincode }) => {
      try {
        if (!productName || productName.trim().length === 0) {
          throw new GraphQLError('Product name is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (!customerAddress || customerAddress.trim().length === 0) {
          throw new GraphQLError('Customer address is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (!pincode || pincode.trim().length === 0) {
          throw new GraphQLError('Pincode is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const sellers = await Seller.find({ pincode: pincode.trim() });
        if (sellers.length === 0) {
          throw new GraphQLError('No sellers serve this pincode', {
            extensions: { code: 'NOT_SERVICEABLE' }
          });
        }

        const order = new Order({
          productName: productName.trim(),
          customerAddress: customerAddress.trim(),
          pincode: pincode.trim(),
          status: 'PENDING'
        });

        await order.save();

        console.log(`New order placed: ${order.productName} for pincode ${order.pincode}`);

        pubsub.publish(NEW_ORDER_EVENT, {
          newOrderArrived: order
        });

        console.log(`Real-time notification sent for pincode ${order.pincode}`);

        return order;
      } catch (error) {
        console.error('Error in placeOrder:', error);
        throw new GraphQLError('Failed to place order', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error.message
          }
        });
      }
    }
  },

  Subscription: {
    newOrderArrived: {
      subscribe: (_, { pincode }) => {
        console.log(`Seller subscribed to orders for pincode: ${pincode}`);
        return pubsub.asyncIterator([NEW_ORDER_EVENT]);
      },

      resolve: (payload, variables) => {
        const order = payload.newOrderArrived;
        const subscriberPincode = variables.pincode;

        if (order.pincode === subscriberPincode) {
          console.log(`Delivering order to seller at pincode ${subscriberPincode}`);
          return order;
        } else {
          console.log(
            `Filtering out order - Order pincode: ${order.pincode}, Subscriber pincode: ${subscriberPincode}`
          );
          return null;
        }
      }
    }
  }
};

module.exports = resolvers;
