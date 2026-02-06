using cake_store_api.Enums;
using System.ComponentModel.DataAnnotations;

namespace cake_store_api.DTOs;

public record CreateOrderRequest(
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string ShippingAddress,
    DateOnly DesiredDeliveryDate, 
    // For MVP, user selects a valid slot date returned by validation logic.
    List<CreateOrderItemDto> Items
);

public record CreateOrderItemDto(
    Guid ProductId, 
    int Quantity,
    string? CustomizationData
);

public record CreateOrderResponse(Guid OrderId, string Status);
