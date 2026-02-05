using cake_store_api.Entities;

namespace cake_store_api.Interfaces;

public interface IProductionSlotService
{
    Task<IEnumerable<ProductionSlot>> GetSlotsAsync(DateOnly startDate, DateOnly endDate);
}
