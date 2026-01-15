require('dotenv').config();
const mongoose = require('mongoose');

const Seller = require('./models/Seller');
const Product = require('./models/Product');
const Order = require('./models/Order');

const MONGODB_URI = process.env.MONGODB_URI;

const ENHANCED_SEED_DATA = {
  udaipurSellers: [
    {
      name: 'Mewar Kirana Store',
      pincode: '313001',
      category: 'Groceries & Essentials',
      products: [
        { name: 'Aashirvaad Whole Wheat Atta (5kg)', price: 240 },
        { name: 'India Gate Classic Basmati Rice (5kg)', price: 525 },
        { name: 'Toor Dal (Arhar) Premium (1kg)', price: 140 },
        { name: 'Fortune Refined Soyabean Oil (1L)', price: 135 },
        { name: 'Amul Salted Butter (500g)', price: 280 },
        { name: 'Mother Dairy Full Cream Milk (1L)', price: 62 },
        { name: 'Nestle Everyday Dairy Whitener (400g)', price: 180 },
        { name: 'Tata Tea Premium (1kg)', price: 470 },
        { name: 'Bru Instant Coffee (200g)', price: 340 },
        { name: 'Red Label Natural Care Tea (1kg)', price: 445 },
        { name: 'MDH Deggi Mirch (100g)', price: 90 },
        { name: 'Everest Garam Masala (100g)', price: 88 },
        { name: 'Catch Salt (1kg)', price: 22 },
        { name: 'Maggi 2-Minute Masala Noodles (Pack of 12)', price: 144 },
        { name: 'Britannia Good Day Butter Cookies (600g)', price: 100 },
        { name: 'Haldiram Aloo Bhujia (400g)', price: 95 },
      ],
    },
    {
      name: 'Lakeside Electronics Hub',
      pincode: '313001',
      category: 'Electronics & Accessories',
      products: [
        { name: 'Samsung 25W Type-C Fast Charger', price: 899 },
        { name: 'Mi 10000mAh Power Bank 3i', price: 999 },
        { name: 'boAt Bassheads 100 Wired Earphones', price: 379 },
        { name: 'Ambrane Unbreakable 3A Type-C Cable (1.5m)', price: 299 },
        { name: 'Logitech B170 Wireless Mouse', price: 595 },
        { name: 'Zebronics K16 USB Keyboard', price: 279 },
        { name: 'HP v236w 64GB USB 2.0 Pendrive', price: 549 },
        { name: 'Philips Ace Saver 9W LED Bulb (Pack of 4)', price: 399 },
        { name: 'Havells Crabtree Athena 4-way Extension Board', price: 349 },
        { name: 'Duracell AA Alkaline Batteries (Pack of 8)', price: 240 },
        { name: 'AmazonBasics 3.5mm Aux Cable (1.2m)', price: 199 },
      ],
    },
    {
      name: 'Udaipur Medical Store',
      pincode: '313001',
      category: 'Health & Wellness',
      products: [
        { name: 'Dettol Original Soap (125g x 4)', price: 156 },
        { name: 'Colgate Total Advanced Health (200g)', price: 180 },
        { name: 'Vicks VapoRub (50ml)', price: 135 },
        { name: 'Band-Aid Adhesive Bandages (100 strips)', price: 125 },
        { name: 'Livon Hair Serum (100ml)', price: 230 },
        { name: 'Fair & Lovely Advanced Multivitamin Cream (80g)', price: 175 },
      ],
    },
  ],

  delhiSellers: [
    {
      name: 'Capital Tech Store',
      pincode: '110001',
      category: 'Electronics & Gadgets',
      products: [
        { name: 'OnePlus Bullets Wireless Z2 ANC', price: 2299 },
        { name: 'boAt Rockerz 450 Bluetooth Headphones', price: 1499 },
        { name: 'JBL Go 3 Portable Bluetooth Speaker', price: 2799 },
        { name: 'Logitech M331 Silent Plus Wireless Mouse', price: 895 },
        { name: 'HP 32GB USB 3.0 Pendrive', price: 649 },
        { name: 'Portronics Toad 13 Wireless Keyboard & Mouse Combo', price: 999 },
        { name: 'SanDisk Ultra 128GB microSD Card', price: 999 },
        { name: 'Seagate 1TB External HDD', price: 3999 },
      ],
    },
  ],

  mumbaiSellers: [
    {
      name: 'Mumbai Fresh Bazaar',
      pincode: '400001',
      category: 'Fresh Produce & Groceries',
      products: [
        { name: 'Fresh Alphonso Mangoes (1 Dozen)', price: 850 },
        { name: 'Kesar Mangoes Premium (6 pieces)', price: 480 },
        { name: 'Fresh Pomegranate (4 pieces)', price: 280 },
        { name: 'Imported Apples (1kg)', price: 180 },
        { name: 'Fresh Tomatoes (1kg)', price: 40 },
        { name: 'Onions (1kg)', price: 35 },
        { name: 'Green Capsicum (500g)', price: 45 },
        { name: 'Amul Taaza Toned Milk (1L)', price: 56 },
        { name: 'Mother Dairy Dahi (400g)', price: 32 },
        { name: 'Britannia Bread 100% Whole Wheat (400g)', price: 42 },
        { name: 'Amul Cheese Slices (200g)', price: 130 },
      ],
    },
  ],

  bangaloreSellers: [
    {
      name: 'Namma Store Bangalore',
      pincode: '560001',
      category: 'South Indian Groceries',
      products: [
        { name: 'MTR Rava Idli Mix (500g)', price: 85 },
        { name: 'MTR Dosa Mix (500g)', price: 80 },
        { name: 'Nandini Pure Ghee (500ml)', price: 350 },
        { name: 'Anil Idli Rice (1kg)', price: 65 },
        { name: 'Cothas Filter Coffee Powder (500g)', price: 280 },
        { name: 'BRU Gold Instant Coffee (200g)', price: 480 },
        { name: 'Fresh Coconut (3 pieces)', price: 90 },
        { name: 'Curry Leaves Fresh (100g)', price: 20 },
        { name: 'Madras Sambhar Powder (200g)', price: 75 },
      ],
    },
  ],

  jaipurSellers: [
    {
      name: 'Pink City Provisions',
      pincode: '302001',
      category: 'Groceries',
      products: [
        { name: 'Rajasthani Besan (Gram Flour) 1kg', price: 95 },
        { name: 'Dal Bati Churma Mix (500g)', price: 120 },
        { name: 'Gatte ki Sabzi Masala (100g)', price: 60 },
        { name: 'Pure Desi Ghee (500ml)', price: 450 },
        { name: 'Papad Rajasthani (200g)', price: 80 },
      ],
    },
  ],
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function cleanDatabase() {
  console.log('\nCleaning existing data...');
  
  try {
    const sellersDeleted = await Seller.deleteMany({});
    console.log(`Deleted ${sellersDeleted.deletedCount} sellers`);
    
    const productsDeleted = await Product.deleteMany({});
    console.log(`Deleted ${productsDeleted.deletedCount} products`);
    
    const ordersDeleted = await Order.deleteMany({});
    console.log(`Deleted ${ordersDeleted.deletedCount} orders`);
    
    console.log('Database cleaned successfully\n');
  } catch (error) {
    console.error('Error cleaning database:', error.message);
    throw error;
  }
}

async function seedSellersAndProducts(sellerData, scenarioName) {
  console.log(`\n${scenarioName}`);
  console.log('='.repeat(60));
  
  for (const sellerInfo of sellerData) {
    try {
      const seller = new Seller({
        name: sellerInfo.name,
        pincode: sellerInfo.pincode,
        category: sellerInfo.category,
      });
      
      await seller.save();
      console.log(`Created Seller: ${seller.name}`);
      console.log(`Pincode: ${seller.pincode}`);
      console.log(`Category: ${seller.category}`);
      
      let productCount = 0;
      for (const productInfo of sellerInfo.products) {
        const product = new Product({
          name: productInfo.name,
          price: productInfo.price,
          seller: seller._id,
        });
        
        await product.save();
        productCount++;
        console.log(`Added product: ${product.name} - Rs ${product.price}`);
      }
      
      console.log(`Added ${productCount} products\n`);
    } catch (error) {
      console.error(`Error creating seller ${sellerInfo.name}:`, error.message);
    }
  }
}

async function printSummary() {
  console.log('\nENHANCED SEEDING SUMMARY');
  console.log('='.repeat(60));
  
  const sellersCount = await Seller.countDocuments();
  const productsCount = await Product.countDocuments();
  
  console.log(`Total Sellers: ${sellersCount}`);
  console.log(`Total Products: ${productsCount}`);
  
  console.log('\nSellers by Pincode:');
  const pincodes = await Seller.distinct('pincode');
  
  for (const pincode of pincodes.sort()) {
    const sellers = await Seller.find({ pincode }).select('name category');
    const productCount = await Product.countDocuments({
      seller: { $in: sellers.map(s => s._id) }
    });
    
    console.log(`\n${pincode}: ${sellers.length} seller(s), ${productCount} products`);
    sellers.forEach(seller => {
      console.log(`${seller.name} (${seller.category})`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

function printTestingInstructions() {
  console.log('\nENHANCED DATA SEEDING COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nTESTING GUIDE:\n');
  
  console.log('AVAILABLE CITIES & PINCODES:');
  console.log('313001 - Udaipur');
  console.log('110001 - Delhi');
  console.log('400001 - Mumbai');
  console.log('560001 - Bangalore');
  console.log('302001 - Jaipur');
  console.log('999999 - Empty\n');
  
  console.log('RECOMMENDED TEST FLOW:');
  console.log('1. Search 313001');
  console.log('2. Search 560001');
  console.log('3. Search 302001');
  console.log('4. Open 2 seller dashboards');
  console.log('5. Place order for 313001\n');
  
  console.log('Products include realistic Indian brands\n');
  console.log('='.repeat(60));
}

async function seed() {
  console.log('\n' + '='.repeat(60));
  console.log('ENHANCED HYPERLOCAL MARKETPLACE - DATA SEEDING');
  console.log('='.repeat(60));
  
  try {
    await connectDB();
    await cleanDatabase();
    
    await seedSellersAndProducts(
      ENHANCED_SEED_DATA.udaipurSellers,
      'Udaipur Cluster (313001) - Multi-Category Hub'
    );
    
    await seedSellersAndProducts(
      ENHANCED_SEED_DATA.delhiSellers,
      'Delhi Cluster (110001) - Premium Tech'
    );
    
    await seedSellersAndProducts(
      ENHANCED_SEED_DATA.mumbaiSellers,
      'Mumbai Cluster (400001) - Fresh Produce'
    );
    
    await seedSellersAndProducts(
      ENHANCED_SEED_DATA.bangaloreSellers,
      'Bangalore Cluster (560001) - South Indian Specialties'
    );
    
    await seedSellersAndProducts(
      ENHANCED_SEED_DATA.jaipurSellers,
      'Jaipur Cluster (302001) - Rajasthani Products'
    );
    
    await printSummary();
    printTestingInstructions();
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    console.log('Enhanced seeding completed\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\nSEEDING FAILED:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
