export declare enum UserRole {
    CUSTOMER = "customer",
    VENDOR = "vendor",
    ADMIN = "admin"
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
export interface Restaurant {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    cuisineType: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    email: string;
    openingTime: string;
    closingTime: string;
    rating: number;
    totalReviews: number;
    isActive: boolean;
    images?: RestaurantImage[];
    createdAt: Date;
    updatedAt: Date;
}
export interface RestaurantImage {
    id: string;
    restaurantId: string;
    imageUrl: string;
    isPrimary: boolean;
    createdAt: Date;
}
export interface RestaurantFilters {
    cuisine?: string;
    location?: string;
    rating?: number;
    openNow?: boolean;
    search?: string;
}
export interface Table {
    id: string;
    restaurantId: string;
    tableNumber: string;
    capacity: number;
    isAvailable: boolean;
    createdAt: Date;
}
export declare enum ReservationStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export interface Reservation {
    id: string;
    customerId: string;
    restaurantId: string;
    tableId: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    status: ReservationStatus;
    specialNotes?: string;
    commissionPaid: boolean;
    customer?: User;
    restaurant?: Restaurant;
    table?: Table;
    payment?: Payment;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateReservationDTO {
    restaurantId: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    specialNotes?: string;
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export interface Payment {
    id: string;
    reservationId: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    createdAt: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface TimeSlot {
    time: string;
    available: boolean;
    tablesAvailable: number;
}
export interface AvailabilityRequest {
    restaurantId: string;
    date: string;
    guestCount: number;
}
//# sourceMappingURL=index.d.ts.map