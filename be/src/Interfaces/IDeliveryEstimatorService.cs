
namespace cake_store_api.Interfaces;

public interface IDeliveryEstimatorService
{
    Task<DateOnly> EstimateDeliveryDateAsync(List<(Guid ProductId, int Quantity)> items);
}
