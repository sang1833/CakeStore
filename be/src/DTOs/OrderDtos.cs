using cake_store_api.Enums;

namespace cake_store_api.DTOs;

public record OrderSummaryDto(
    Guid Id,
    DateTime CreatedAt,
    string Status,
    decimal TotalAmount,
    int ItemCount
);

public record OrderDetailDto(
    Guid Id,
    DateTime CreatedAt,
    string Status,
    decimal TotalAmount,
    string ShippingAddress,
    DateTime DeliveryDate,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal Price
);
