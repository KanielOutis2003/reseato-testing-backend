import pool from '../config/database';
import { Restaurant, RestaurantFilters } from '../../../shared/types';
import { AppError } from '../middleware/errorHandler';

export class RestaurantService {
  async getAllRestaurants(filters: RestaurantFilters = {}): Promise<Restaurant[]> {
    let query = `
      SELECT r.*, 
             COALESCE(json_agg(
               json_build_object(
                 'id', ri.id,
                 'imageUrl', ri.image_url,
                 'isPrimary', ri.is_primary
               )
             ) FILTER (WHERE ri.id IS NOT NULL), '[]') as images
      FROM restaurants r
      LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
      WHERE r.is_active = true
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (filters.cuisine) {
      paramCount++;
      query += ` AND LOWER(r.cuisine_type) = LOWER($${paramCount})`;
      params.push(filters.cuisine);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (
        LOWER(r.name) LIKE LOWER($${paramCount}) OR 
        LOWER(r.description) LIKE LOWER($${paramCount}) OR
        LOWER(r.cuisine_type) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${filters.search}%`);
    }

    if (filters.rating) {
      paramCount++;
      query += ` AND r.rating >= $${paramCount}`;
      params.push(filters.rating);
    }

    query += ' GROUP BY r.id ORDER BY r.rating DESC, r.total_reviews DESC';

    const result = await pool.query(query, params);
    return result.rows.map(row => this.mapRestaurant(row));
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const result = await pool.query(
      `SELECT r.*,
              COALESCE(json_agg(
                json_build_object(
                  'id', ri.id,
                  'imageUrl', ri.image_url,
                  'isPrimary', ri.is_primary
                )
              ) FILTER (WHERE ri.id IS NOT NULL), '[]') as images
       FROM restaurants r
       LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
       WHERE r.id = $1
       GROUP BY r.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRestaurant(result.rows[0]);
  }

  async getRestaurantByOwnerId(ownerId: string): Promise<Restaurant | null> {
    const result = await pool.query(
      `SELECT r.*,
              COALESCE(json_agg(
                json_build_object(
                  'id', ri.id,
                  'imageUrl', ri.image_url,
                  'isPrimary', ri.is_primary
                )
              ) FILTER (WHERE ri.id IS NOT NULL), '[]') as images
       FROM restaurants r
       LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
       WHERE r.owner_id = $1
       GROUP BY r.id`,
      [ownerId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRestaurant(result.rows[0]);
  }

  async createRestaurant(ownerId: string, data: any): Promise<Restaurant> {
    const {
      name,
      description,
      cuisineType,
      address,
      latitude,
      longitude,
      phone,
      email,
      openingTime,
      closingTime
    } = data;

    // Check if owner already has a restaurant
    const existing = await this.getRestaurantByOwnerId(ownerId);
    if (existing) {
      throw new AppError('Vendor can only have one restaurant', 400);
    }

    const result = await pool.query(
      `INSERT INTO restaurants 
       (owner_id, name, description, cuisine_type, address, latitude, longitude, 
        phone, email, opening_time, closing_time, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [ownerId, name, description, cuisineType, address, latitude, longitude, 
       phone, email, openingTime, closingTime, false] // Start as inactive until admin approves
    );

    return this.mapRestaurant(result.rows[0]);
  }

  async updateRestaurant(id: string, ownerId: string, data: any): Promise<Restaurant> {
    // Verify ownership
    const restaurant = await this.getRestaurantById(id);
    if (!restaurant || restaurant.ownerId !== ownerId) {
      throw new AppError('Restaurant not found or unauthorized', 404);
    }

    const fields = [];
    const values = [];
    let paramCount = 0;

    const updateableFields = [
      'name', 'description', 'cuisine_type', 'address', 'latitude', 'longitude',
      'phone', 'email', 'opening_time', 'closing_time'
    ];

    for (const field of updateableFields) {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (data[camelField] !== undefined) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        values.push(data[camelField]);
      }
    }

    if (fields.length === 0) {
      return restaurant;
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE restaurants 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return this.mapRestaurant(result.rows[0]);
  }

  async getTables(restaurantId: string): Promise<any[]> {
    const result = await pool.query(
      'SELECT * FROM tables WHERE restaurant_id = $1 ORDER BY table_number',
      [restaurantId]
    );

    return result.rows;
  }

  async addTable(restaurantId: string, tableNumber: string, capacity: number): Promise<any> {
    const result = await pool.query(
      'INSERT INTO tables (restaurant_id, table_number, capacity) VALUES ($1, $2, $3) RETURNING *',
      [restaurantId, tableNumber, capacity]
    );

    return result.rows[0];
  }

  private mapRestaurant(row: any): Restaurant {
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description,
      cuisine: row.cuisine,
      cuisineType: row.cuisine_type,
      address: row.address,
      city: row.city,
      zipCode: row.zip_code,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      phone: row.phone,
      email: row.email,
      website: row.website,
      openingHours: row.opening_hours,
      openingTime: row.opening_time,
      closingTime: row.closing_time,
      rating: parseFloat(row.rating || 0),
      totalReviews: row.total_reviews || 0,
      isActive: row.is_active,
      images: row.images || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default new RestaurantService();