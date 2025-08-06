// scripts/debug-database.js
require('dotenv').config();
const path = require('path');

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database connection...');
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('- DB_HOST:', process.env.DB_HOST);
    console.log('- DB_NAME:', process.env.DB_NAME);
    console.log('- DB_USER:', process.env.DB_USER);
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not set');
    
    // Try to load models
    console.log('\n📋 Loading models...');
    const modelsPath = path.join(__dirname, '..', 'models');
    console.log('Models path:', modelsPath);
    
    const { sequelize, CarnivalGroup, Category, User, Product } = require(modelsPath);
    console.log('✅ Models loaded successfully');
    
    // Test database connection
    console.log('\n🔗 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check existing tables
    console.log('\n📊 Checking database tables...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('Existing tables:', tables);
    
    // Sync database
    console.log('\n🔄 Synchronizing database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database sync successful');
    
    // Check tables after sync
    const tablesAfterSync = await queryInterface.showAllTables();
    console.log('Tables after sync:', tablesAfterSync);
    
    // Test model operations
    console.log('\n🧪 Testing model operations...');
    
    // Count existing records
    const groupCount = await CarnivalGroup.count();
    const categoryCount = await Category.count();
    console.log(`- Carnival Groups: ${groupCount} records`);
    console.log(`- Categories: ${categoryCount} records`);
    
    // Try creating a test record
    console.log('\n✨ Creating test carnival group...');
    const [testGroup, created] = await CarnivalGroup.findOrCreate({
      where: { name: 'Test Group', city: 'Test City' },
      defaults: {
        name: 'Test Group',
        city: 'Test City',
        country: 'Belgium',
        description: 'Test group for debugging',
        verified: false
      }
    });
    
    if (created) {
      console.log('✅ Test group created successfully');
      // Clean up test record
      await testGroup.destroy();
      console.log('🗑️ Test group deleted');
    } else {
      console.log('ℹ️ Test group already existed');
    }
    
    console.log('\n🎉 Database debug completed successfully!');
    
  } catch (error) {
    console.error('❌ Database debug failed:', error);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Connection troubleshooting tips:');
      console.log('1. Check your DATABASE_URL in .env file');
      console.log('2. Ensure your Neon database is active');
      console.log('3. Verify your database credentials');
      console.log('4. Check if your IP is whitelisted (if using cloud database)');
    }
  } finally {
    const { sequelize } = require(path.join(__dirname, '..', 'models'));
    try {
      await sequelize.close();
      console.log('🔒 Database connection closed');
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

// Run debug function
if (require.main === module) {
  debugDatabase();
}

module.exports = { debugDatabase };