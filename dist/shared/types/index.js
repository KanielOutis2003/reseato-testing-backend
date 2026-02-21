"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["VENDOR"] = "vendor";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "pending";
    ReservationStatus["CONFIRMED"] = "confirmed";
    ReservationStatus["CANCELLED"] = "cancelled";
    ReservationStatus["COMPLETED"] = "completed";
    ReservationStatus["REJECTED"] = "rejected";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
//# sourceMappingURL=index.js.map