import { Restaurant, RestaurantFilters } from '../../../shared/types';
export declare class RestaurantService {
    getAllRestaurants(filters?: RestaurantFilters): Promise<Restaurant[]>;
    getRestaurantById(id: string): Promise<Restaurant | null>;
    getRestaurantByOwnerId(ownerId: string): Promise<Restaurant | null>;
    createRestaurant(ownerId: string, data: any): Promise<Restaurant>;
    updateRestaurant(id: string, ownerId: string, data: any): Promise<Restaurant>;
    getTables(restaurantId: string): Promise<any[]>;
    addTable(restaurantId: string, tableNumber: string, capacity: number): Promise<any>;
    private mapRestaurant;
}
declare const _default: RestaurantService;
export default _default;
//# sourceMappingURL=restaurantService.d.ts.map