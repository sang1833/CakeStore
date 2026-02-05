namespace cake_store_api.Enums;

public enum OrderStatus
{
    New = 1,
    Confirmed = 2,
    Production = 3, // Packing for Type A, Kitchen for Type B
    ReadyToShip = 4,
    Delivering = 5,
    Completed = 6,
    Cancelled = 99
}
