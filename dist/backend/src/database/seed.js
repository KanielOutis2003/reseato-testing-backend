"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../../../shared/types");
const seed = async () => {
    const client = await database_1.default.connect();
    try {
        console.log('🌱 Starting seed...');
        // Clear existing data
        await client.query('TRUNCATE TABLE payments, reservations, tables, restaurant_images, restaurants, users CASCADE');
        // Create users
        const passwordHash = await bcryptjs_1.default.hash('password123', 12);
        const users = [
            {
                email: 'admin@example.com',
                password: passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: types_1.UserRole.ADMIN,
                phone: '09123456789'
            },
            {
                email: 'vendor@example.com',
                password: passwordHash,
                firstName: 'John',
                lastName: 'Vendor',
                role: types_1.UserRole.VENDOR,
                phone: '09987654321'
            },
            {
                email: 'customer@example.com',
                password: passwordHash,
                firstName: 'Jane',
                lastName: 'Customer',
                role: types_1.UserRole.CUSTOMER,
                phone: '09111111111'
            }
        ];
        const createdUsers = [];
        for (const user of users) {
            const res = await client.query(`INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`, [user.email, user.password, user.firstName, user.lastName, user.role, user.phone]);
            createdUsers.push(res.rows[0]);
            console.log(`✅ Created user: ${user.email}`);
        }
        const vendor = createdUsers.find(u => u.role === types_1.UserRole.VENDOR);
        // Restaurants Data
        const restaurantsData = [
            {
                name: 'Seaside Delight',
                description: 'Experience the best seafood in Cebu with a view of the ocean.',
                cuisine: 'Seafood',
                cuisine_type: 'Filipino',
                address: 'SM Seaside City, Cebu',
                city: 'Cebu City',
                zip_code: '6000',
                phone: '032-123-4567',
                email: 'contact@seasidedelight.com',
                opening_time: '10:00:00',
                closing_time: '22:00:00',
                is_active: true,
                rating: 4.5,
                total_reviews: 120,
                latitude: 10.2829,
                longitude: 123.8854,
                image: '/assets/images/seaside-delight.jpg' // Placeholder as user didn't provide this image
            },
            {
                name: "Bigby's",
                description: 'Fun dining atmosphere with large servings perfect for sharing.',
                cuisine: 'International',
                cuisine_type: 'American',
                address: 'SM City Cebu, North Reclamation Area',
                city: 'Cebu City',
                zip_code: '6000',
                phone: '032-234-5678',
                email: 'info@bigbys.com',
                opening_time: '10:00:00',
                closing_time: '21:00:00',
                is_active: true,
                rating: 4.7,
                total_reviews: 250,
                latitude: 10.3115,
                longitude: 123.9180,
                image: "/assets/images/bigby's.jpg"
            },
            {
                name: "Chili's",
                description: 'Family-friendly chain serving classic Tex-Mex & American fare.',
                cuisine: 'Tex-Mex',
                cuisine_type: 'American',
                address: 'Ayala Center Cebu, Cebu Business Park',
                city: 'Cebu City',
                zip_code: '6000',
                phone: '032-345-6789',
                email: 'cebu@chilis.com',
                opening_time: '11:00:00',
                closing_time: '23:00:00',
                is_active: true,
                rating: 4.6,
                total_reviews: 310,
                latitude: 10.3173,
                longitude: 123.9056,
                image: "/assets/images/chill's.jpg"
            },
            {
                name: 'Cabalen',
                description: 'All-you-can-eat Filipino buffet featuring Kapampangan specialties.',
                cuisine: 'Filipino',
                cuisine_type: 'Buffet',
                address: 'SM City Cebu, North Reclamation Area',
                city: 'Cebu City',
                zip_code: '6000',
                phone: '032-456-7890',
                email: 'inquiry@cabalen.ph',
                opening_time: '10:00:00',
                closing_time: '21:00:00',
                is_active: true,
                rating: 4.3,
                total_reviews: 180,
                latitude: 10.3118,
                longitude: 123.9182,
                image: '/assets/images/cabalen.avif'
            },
            {
                name: 'Brique',
                description: 'Modern dining with a rustic vibe offering comfort food and wine.',
                cuisine: 'Modern European',
                cuisine_type: 'Cafe',
                address: 'Salinas Drive, Lahug',
                city: 'Cebu City',
                zip_code: '6000',
                phone: '032-567-8901',
                email: 'hello@brique.ph',
                opening_time: '07:00:00',
                closing_time: '22:00:00',
                is_active: true,
                rating: 4.8,
                total_reviews: 95,
                latitude: 10.3294,
                longitude: 123.9030,
                image: '/assets/images/brique.jpg'
            }
        ];
        for (const rData of restaurantsData) {
            // Create Restaurant
            const restaurantRes = await client.query(`INSERT INTO restaurants (
          owner_id, name, description, cuisine, cuisine_type, address, city, zip_code, 
          phone, email, opening_time, closing_time, is_active, rating, total_reviews,
          latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`, [
                vendor.id,
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
            ]);
            const restaurant = restaurantRes.rows[0];
            console.log(`✅ Created restaurant: ${restaurant.name}`);
            // Add Images
            await client.query(`INSERT INTO restaurant_images (restaurant_id, image_url, is_primary)
         VALUES ($1, $2, $3)`, [restaurant.id, rData.image, true]);
            // Add Tables (Standard set for all)
            const tables = [
                { number: 'T1', capacity: 2 },
                { number: 'T2', capacity: 2 },
                { number: 'T3', capacity: 4 },
                { number: 'T4', capacity: 4 },
                { number: 'T5', capacity: 6 },
                { number: 'T6', capacity: 8 },
            ];
            for (const table of tables) {
                await client.query(`INSERT INTO tables (restaurant_id, table_number, capacity)
           VALUES ($1, $2, $3)`, [restaurant.id, table.number, table.capacity]);
            }
        }
        console.log('✨ Seed completed successfully');
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
    finally {
        client.release();
        await database_1.default.end();
    }
};
seed();
//# sourceMappingURL=seed.js.map