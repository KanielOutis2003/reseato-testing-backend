import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { UserRole } from '../../../shared/types';

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await client.query('TRUNCATE TABLE payments, reservations, tables, restaurant_images, restaurants, users CASCADE');

    const passwordHash = await bcrypt.hash('password123', 12);

    // 1. Create Admin and Customer Users
    const baseUsers = [
      {
        email: 'admin@example.com',
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        phone: '09123456789'
      },
      {
        email: 'customer@example.com',
        password: passwordHash,
        firstName: 'Jane',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
        phone: '09111111111'
      }
    ];

    for (const user of baseUsers) {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.email, user.password, user.firstName, user.lastName, user.role, user.phone]
      );
      console.log(`✅ Created user: ${user.email}`);
    }

    // 2. Define Restaurants with their specific Owners
    const restaurantsData = [
      {
        owner: {
          email: 'cabalen@reseato.com',
          firstName: 'Cabalen',
          lastName: 'Manager',
        },
        name: 'Cabalen',
        description: 'All-you-can-eat Filipino buffet featuring Kapampangan specialties.',
        cuisine: 'Filipino',
        cuisine_type: 'Buffet',
        address: 'SM Seaside City, Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '032-456-7890',
        email: 'inquiry@cabalen.ph',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.3,
        total_reviews: 180,
        latitude: 10.2830,
        longitude: 123.8855,
        image: '/assets/images/cabalen.avif'
      },
      {
        owner: {
          email: 'chikaan@reseato.com',
          firstName: 'Chika-an',
          lastName: 'Manager',
        },
        name: 'Chika-an Cebuano Kitchen',
        description: 'Authentic Cebuano dishes served in a homey atmosphere.',
        cuisine: 'Filipino',
        cuisine_type: 'Filipino',
        address: 'SM City Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '032-233-0350',
        email: 'info@chikaan.com',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.6,
        total_reviews: 150,
        latitude: 10.3115,
        longitude: 123.9180,
        image: '/assets/images/Chika-an Cebu Kitchen.jpg'
      },
      {
        owner: {
          email: 'superbowl@reseato.com',
          firstName: 'Superbowl',
          lastName: 'Manager',
        },
        name: 'Superbowl of China',
        description: 'Serving delicious Chinese favorites and dimsum.',
        cuisine: 'Chinese',
        cuisine_type: 'Chinese',
        address: 'SM City Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '032-231-1234',
        email: 'info@superbowl.com',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.4,
        total_reviews: 200,
        latitude: 10.3116,
        longitude: 123.9181,
        image: '/assets/images/Superbowl of China.jpg'
      },
      {
        owner: {
          email: 'sachiramen@reseato.com',
          firstName: 'Sachi',
          lastName: 'Manager',
        },
        name: 'Sachi Ramen',
        description: 'Authentic Japanese Ramen and Asian fusion dishes.',
        cuisine: 'Japanese',
        cuisine_type: 'Ramen',
        address: 'SM City Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '032-412-4567',
        email: 'info@sachiramen.com',
        opening_time: '11:00:00',
        closing_time: '22:00:00',
        is_active: true,
        rating: 4.7,
        total_reviews: 80,
        latitude: 10.3117,
        longitude: 123.9182,
        image: '/assets/images/Sachi Ramen.jpg'
      },
      {
        owner: {
          email: 'seoulblack@reseato.com',
          firstName: 'Seoul',
          lastName: 'Manager',
        },
        name: 'Seoul Black',
        description: 'Authentic Korean cuisine in the heart of SM Seaside.',
        cuisine: 'Korean',
        cuisine_type: 'Korean',
        address: 'Upper Ground Floor, Cube Wing, SM Seaside City Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '0927 508 6275',
        email: 'contact@seoulblack.com',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.5,
        total_reviews: 45,
        latitude: 10.2829,
        longitude: 123.8854,
        image: '/assets/images/Seoul Black.jpg'
      },
      {
        owner: {
          email: 'seafoodribs@reseato.com',
          firstName: 'Seafood',
          lastName: 'Manager',
        },
        name: 'Seafood & Ribs Warehouse',
        description: 'Fresh Seafood Paluto Restaurant. NO COOKING FEE 💯',
        cuisine: 'Seafood',
        cuisine_type: 'Filipino',
        address: '3F Mountain Wing Skypark, SM Seaside Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '0917 123 4567',
        email: 'info@seafoodribs.com',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.6,
        total_reviews: 110,
        latitude: 10.2829,
        longitude: 123.8854,
        image: '/assets/images/Seafood & Ribs warehouse.webp'
      },
      {
        owner: {
          email: 'kuyaj@reseato.com',
          firstName: 'Kuya',
          lastName: 'J',
        },
        name: 'Kuya J',
        description: 'Crispy Pata, Kare-Kare, and other Filipino favorites.',
        cuisine: 'Filipino',
        cuisine_type: 'Filipino',
        address: '1161-1163 SM Seaside City Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '0998 962 4273',
        email: 'contact@kuyaj.com',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.4,
        total_reviews: 200,
        latitude: 10.2829,
        longitude: 123.8854,
        image: '/assets/images/Kuya J.png'
      },
      {
        owner: {
          email: 'somac@reseato.com',
          firstName: 'Somac',
          lastName: 'Manager',
        },
        name: 'Somac Korean Restaurant',
        description: 'Every corner of Somac Buffet is filled with festive cheer and holiday joy!',
        cuisine: 'Korean',
        cuisine_type: 'Buffet',
        address: '3rd Floor, Skypark, SM Seaside',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '0967 093 2546',
        email: 'somacsmseaside@gmail.com',
        opening_time: '11:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.8,
        total_reviews: 150,
        latitude: 10.2829,
        longitude: 123.8854,
        image: '/assets/images/SoMac.jpg'
      },
      {
        owner: {
          email: 'mesa@reseato.com',
          firstName: 'Mesa',
          lastName: 'Manager',
        },
        name: 'Mesa Restaurant Philippines',
        description: 'Don\'t be fooled! This deep fried baby squid might be your next favorite!',
        cuisine: 'Filipino',
        cuisine_type: 'Filipino',
        address: 'Upper Ground Floor, Mountain Wing, SM Seaside Cebu',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '0977 032 4649',
        email: 'contact@mesa.ph',
        opening_time: '10:00:00',
        closing_time: '22:00:00',
        is_active: true,
        rating: 4.5,
        total_reviews: 90,
        latitude: 10.2829,
        longitude: 123.8854,
        image: '/assets/images/Mesa Restaurant Phillippines.png'
      },
      {
        owner: {
          email: 'boybelly@reseato.com',
          firstName: 'Boy',
          lastName: 'Belly',
        },
        name: 'Boy Belly',
        description: 'Boy Belly, Happy Ta Diri! Serving Cebu\'s best Lechon Belly.',
        cuisine: 'Filipino',
        cuisine_type: 'Filipino',
        address: '3rd Level, City Wing, The Skypark, SM Seaside',
        city: 'Cebu City',
        zip_code: '6000',
        phone: '032-123-9999',
        email: 'info@boybelly.com',
        opening_time: '10:00:00',
        closing_time: '21:00:00',
        is_active: true,
        rating: 4.2,
        total_reviews: 60,
        latitude: 10.2829,
        longitude: 123.8854,
        image: '/assets/images/Boy Belly.png'
      }
    ];

    for (const rData of restaurantsData) {
      // 3. Create Vendor User for this Restaurant
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [rData.owner.email, passwordHash, rData.owner.firstName, rData.owner.lastName, UserRole.VENDOR, '09000000000']
      );
      const ownerId = userRes.rows[0].id;
      console.log(`✅ Created vendor: ${rData.owner.email}`);

      // 4. Create Restaurant linked to this Owner
      const restaurantRes = await client.query(
        `INSERT INTO restaurants (
          owner_id, name, description, cuisine, cuisine_type, address, city, zip_code, 
          phone, email, opening_time, closing_time, is_active, rating, total_reviews,
          latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          ownerId,
          rData.name,
          rData.description,
          rData.cuisine,
          rData.cuisine_type,
          rData.address,
          rData.city,
          rData.zip_code,
          rData.phone,
          rData.email,
          rData.opening_time,
          rData.closing_time,
          rData.is_active,
          rData.rating,
          rData.total_reviews,
          rData.latitude,
          rData.longitude
        ]
      );

      const restaurant = restaurantRes.rows[0];
      console.log(`✅ Created restaurant: ${restaurant.name}`);

      // Add Images
      await client.query(
        `INSERT INTO restaurant_images (restaurant_id, image_url, is_primary)
         VALUES ($1, $2, $3)`,
        [restaurant.id, rData.image, true]
      );

      // Add Tables
      const tables = [
        { number: 'T1', capacity: 2, is_available: true },
        { number: 'T2', capacity: 2, is_available: true },
        { number: 'T3', capacity: 4, is_available: true },
        { number: 'T4', capacity: 4, is_available: true },
        { number: 'T5', capacity: 6, is_available: true },
        { number: 'T6', capacity: 8, is_available: true },
      ];

      for (const table of tables) {
        await client.query(
          `INSERT INTO tables (restaurant_id, table_number, capacity, is_available)
           VALUES ($1, $2, $3, $4)`,
          [restaurant.id, table.number, table.capacity, table.is_available]
        );
      }
    }

    console.log('✨ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
