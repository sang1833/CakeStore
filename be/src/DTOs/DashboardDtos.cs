namespace cake_store_api.DTOs;

public record DashboardSummaryDto(
    decimal TotalRevenue,
    int TotalOrders,
    int TodayOrders,
    int PendingOrders,
    List<TopProductDto> TopProducts
);

public record TopProductDto(
    Guid ProductId,
    string ProductName,
    int OrderCount,
    decimal TotalRevenue
);
