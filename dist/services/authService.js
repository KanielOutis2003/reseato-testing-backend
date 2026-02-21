"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../../../shared/types");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    async register(data) {
        const { email, password, firstName, lastName, phone, role = types_1.UserRole.CUSTOMER } = data;
        // Check if user already exists
        const existingUser = await database_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            throw new errorHandler_1.AppError('Email already registered', 400);
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const result = await database_1.default.query(`INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`, [email, passwordHash, firstName, lastName, phone, role]);
        const user = this.mapUser(result.rows[0]);
        const token = this.generateToken(user);
        return { user, token };
    }
    async login(data) {
        const { email, password } = data;
        // Find user
        const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        const userRow = result.rows[0];
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, userRow.password_hash);
        if (!isValidPassword) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        const user = this.mapUser(userRow);
        const token = this.generateToken(user);
        return { user, token };
    }
    async getUserById(id) {
        const result = await database_1.default.query(`SELECT id, email, first_name, last_name, phone, role, created_at, updated_at
       FROM users WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapUser(result.rows[0]);
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    }
    mapUser(row) {
        return {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            phone: row.phone,
            role: row.role,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=authService.js.map