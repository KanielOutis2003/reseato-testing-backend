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
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface RestaurantImage {
    id?: string;
    url: string;
    imageUrl?: string;
    isPrimary: boolean;
}
export interface Table {
    id: string;
    tableNumber: string;
    capacity: number;
    restaurantId: string;
}
export interface Restaurant {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    cuisine: string;
    cuisineType: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
    email: string;
    website?: string;
    openingHours: {
        [key: string]: {
            open: string;
            close: string;
            closed?: boolean;
        };
    };
    openingTime: string;
    closingTime: string;
    images: RestaurantImage[];
    tables?: Table[];
    rating: number;
    reviewCount?: number;
    totalReviews: number;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface RestaurantFilters {
    cuisine?: string;
    location?: string;
    rating?: number;
    search?: string;
    openNow?: boolean;
}
export declare enum ReservationStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
    REJECTED = "rejected"
}
export interface Reservation {
    id: string;
    userId: string;
    restaurantId: string;
    tableId?: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    status: ReservationStatus;
    specialNotes?: string;
    user?: User;
    customer?: User;
    customerId?: string;
    restaurant?: Restaurant;
    table?: Table;
    commissionPaid?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface CreateReservationDTO {
    restaurantId: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    specialNotes?: string;
}
export interface TimeSlot {
    time: string;
    available: boolean;
    tablesAvailable: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: any[];
    count?: number;
}
//# sourceMappingURL=index.d.ts.map