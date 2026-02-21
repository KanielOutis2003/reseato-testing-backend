import { Reservation, ReservationStatus, CreateReservationDTO, TimeSlot } from '../../../shared/types';
export declare class ReservationService {
    createReservation(customerId: string, data: CreateReservationDTO): Promise<Reservation>;
    getAvailableTimeSlots(restaurantId: string, date: string, guestCount: number): Promise<TimeSlot[]>;
    getCustomerReservations(customerId: string): Promise<Reservation[]>;
    getRestaurantReservations(restaurantId: string, date?: string): Promise<Reservation[]>;
    updateReservationStatus(reservationId: string, status: ReservationStatus, vendorId?: string): Promise<Reservation>;
    cancelReservation(reservationId: string, userId: string): Promise<Reservation>;
    private findAvailableTable;
    private countAvailableTables;
    private isWithinOperatingHours;
    private mapReservation;
}
declare const _default: ReservationService;
export default _default;
//# sourceMappingURL=reservationService.d.ts.map