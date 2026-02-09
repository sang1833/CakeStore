using cake_store_api.Enums;

namespace cake_store_api.DTOs;

public record OrderSummaryDto(
    Guid Id,
    DateTime CreatedAt,
    string Status,
    decimal TotalAmount,
    int ItemCount,
    List<OrderItemDto>? Items = null
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

public record OrderFilterRequest(
    OrderStatus? Status,
    DateTime? StartDate,
    DateTime? EndDate,
    string? CustomerEmail,
    int Page = 1,
    int PageSize = 10
);

public record OrderStatsDto(
    int TotalOrders,
    int NewOrders,
    int ProcessingOrders,
    int CompletedOrders,
    int CancelledOrders,
    decimal TotalRevenue
);

public record PaginatedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
