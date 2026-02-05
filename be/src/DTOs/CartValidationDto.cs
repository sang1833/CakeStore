namespace cake_store_api.DTOs;

public record ValidateCartRequest(List<CartItemDto> Items);

public record CartItemDto(Guid ProductId, int Quantity);

public record ValidateCartResponse(
    bool IsSlotAvailable, 
    DateOnly EarliestAvailableDate, 
    string? Message = null
);
