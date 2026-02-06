using cake_store_api.DTOs;
using cake_store_api.Entities;
using cake_store_api.Enums;

namespace cake_store_api.Interfaces;

public interface IOrderService
{
    Task<CreateOrderResponse> PlaceOrderAsync(CreateOrderRequest request);
    Task AdvanceStatusAsync(Guid orderId, OrderStatus newStatus);
    Task<IEnumerable<Order>> GetOrdersAsync();
    Task<Order?> GetOrderByIdAsync(Guid id);
    Task<IEnumerable<OrderSummaryDto>> GetOrdersByUserIdAsync(string userId);
}
