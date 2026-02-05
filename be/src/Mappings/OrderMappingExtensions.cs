using cake_store_api.DTOs;
using cake_store_api.Entities;
using cake_store_api.Enums;

namespace cake_store_api.Mappings;

public static class OrderMappingExtensions
{
    public static CreateOrderResponse ToCreateOrderResponse(this Order order)
    {
        return new CreateOrderResponse(order.Id, order.Status.ToString());
    }
}
