using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using cake_store_api.DTOs;

namespace cake_store_api.Interfaces;

public interface IDeliveryEstimatorService
{
    Task<DateOnly> EstimateDeliveryDateAsync(List<(Guid ProductId, int Quantity)> items);
    // Task<(bool IsValid, List<string> Errors)> ValidateCartItemsAsync(List<CreateOrderItemDto> items);
}
