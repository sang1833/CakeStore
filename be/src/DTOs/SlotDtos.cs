namespace cake_store_api.DTOs;

public record ProductionSlotDto(
    DateOnly Date,
    int MaxCapacity,
    int ReservedCapacity,
    int AvailableCapacity
);

public record UpdateSlotRequest(
    int MaxCapacity
);
