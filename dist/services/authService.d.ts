import { User, UserRole } from '../../../shared/types';
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
export declare class AuthService {
    register(data: RegisterData): Promise<{
        user: User;
        token: string;
    }>;
    login(data: LoginData): Promise<{
        user: User;
        token: string;
    }>;
    getUserById(id: string): Promise<User | null>;
    private generateToken;
    private mapUser;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map