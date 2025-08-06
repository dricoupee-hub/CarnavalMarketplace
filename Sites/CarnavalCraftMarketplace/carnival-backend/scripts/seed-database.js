// scripts/seed-database-fixed.js
require('dotenv').config();
const path = require('path');

// Make sure we're loading from the correct path
const modelsPath = path.join(__dirname, '..', 'models');
const { sequelize, CarnivalGroup, Category } = require(modelsPath);

// Define data at the top level
const carnivalGroupsData = [
  {
    name: 'Antwerp Devils',
    city: 'Antwerp',
    province: 'Antwerp',
    country: 'Belgium',
    description: 'Traditional carnival group from Antwerp, known for colorful costumes and elaborate floats.',
    verified: true
  },
  {
    name: 'Brussels Masqueraders',
    city: 'Brussels',
    province: 'Brussels-Capital',
    country: 'Belgium',
    description: 'Historic carnival society celebrating Brussels heritage with masks and traditional dances.',
    verified: true
  },
  {
    name: 'Ghent Carnival Society',
    city: 'Ghent',
    province: 'East Flanders',
    country: 'Belgium',
    description: 'Centuries-old carnival tradition in Ghent, featuring parades and community celebrations.',
    verified: true
  },
  {
    name: 'Aalst Carnivalists',
    city: 'Aalst',
    province: 'East Flanders',
    country: 'Belgium',
    description: 'UNESCO recognized carnival group famous for satirical floats and costumes.',
    verified: true
  },
  {
    name: 'Binche Gilles',
    city: 'Binche',
    province: 'Hainaut',
    country: 'Belgium',
    description: 'World-famous Gilles of Binche, UNESCO Intangible Cultural Heritage.',
    verified: true
  }
];

const categoriesData = [
  {
    name: 'Costumes',
    slug: 'costumes',
    description: 'Complete carnival costumes, outfits, and traditional wear',
    emoji: '👗'
  },
  {
    name: 'Masks',
    slug: 'masks',
    description: 'Carnival masks, face coverings, and character pieces',
    emoji: '🎭'
  },
  {
    name: 'Accessories', 
    slug: 'accessories',
    description: 'Carnival accessories, jewelry, hats, and decorative items',
    emoji: '🎩'
  },
  {
    name: 'Decorations',
    slug: 'decorations',
    description: 'Carnival decorations, banners, lights, and party supplies',
    emoji: '🎨'
  },
  {
    name: 'Instruments',
    slug: 'instruments',
    description: 'Musical instruments, drums, and performance equipment',
    emoji: '🥁'
  },
  {
    name: 'Props',
    slug: 'props',
    description: 'Carnival props, float decorations, and performance pieces',
    emoji: '🎪'
  }
];

async function seedDatabase() {
  let connection;
  
  try {
    console.log('🌱 Starting database seeding...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

    // Test database connection first
    console.log('🔗 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync database
    console.log('🔄 Synchronizing database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');

    // Seed Carnival Groups
    console.log('🎭 Seeding carnival groups...');
    let groupsCreated = 0;
    let groupsSkipped = 0;
    
    for (const groupData of carnivalGroupsData) {
      try {
        const [group, created] = await CarnivalGroup.findOrCreate({
          where: { name: groupData.name, city: groupData.city },
          defaults: groupData
        });
        
        if (created) {
          console.log(`✅ Created carnival group: ${group.name}`);
          groupsCreated++;
        } else {
          console.log(`⏭️  Carnival group already exists: ${group.name}`);
          groupsSkipped++;
        }
      } catch (error) {
        console.error(`❌ Error creating group ${groupData.name}:`, error.message);
      }
    }

    // Seed Categories
    console.log('📂 Seeding categories...');
    let categoriesCreated = 0;
    let categoriesSkipped = 0;

    for (const categoryData of categoriesData) {
      try {
        const [category, created] = await Category.findOrCreate({
          where: { slug: categoryData.slug },
          defaults: categoryData
        });
        
        if (created) {
          console.log(`✅ Created category: ${category.name}`);
          categoriesCreated++;
        } else {
          console.log(`⏭️  Category already exists: ${category.name}`);
          categoriesSkipped++;
        }
      } catch (error) {
        console.error(`❌ Error creating category ${categoryData.name}:`, error.message);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Carnival Groups: ${groupsCreated} created, ${groupsSkipped} skipped`);
    console.log(`- Categories: ${categoriesCreated} created, ${categoriesSkipped} skipped`);
    console.log('\n🚀 Your backend is ready for user registration and product listings!');

    return {
      success: true,
      stats: {
        carnivalGroups: { created: groupsCreated, skipped: groupsSkipped },
        categories: { created: categoriesCreated, skipped: categoriesSkipped }
      }
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  } finally {
    try {
      await sequelize.close();
      console.log('🔒 Database connection closed');
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };