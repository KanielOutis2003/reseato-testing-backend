import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User, UserRole } from '../../../shared/types';
import { AppError } from '../middleware/errorHandler';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const { email, password, firstName, lastName, phone, role = UserRole.CUSTOMER } = data;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`,
      [email, passwordHash, firstName, lastName, phone, role]
    );

    const user = this.mapUser(result.rows[0]);
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const { email, password } = data;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const userRow = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userRow.password_hash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = this.mapUser(userRow);
    const token = this.generateToken(user);

    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapUser(result.rows[0]);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const { firstName, lastName, phone } = data;
    
    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`,
      [firstName, lastName, phone, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return this.mapUser(result.rows[0]);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      role: row.role as UserRole,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default new AuthService();