using cake_store_api.Data;
using cake_store_api.Entities;
using cake_store_api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace cake_store_api.Services;

public class ProductionSlotService : IProductionSlotService
{
    private readonly AppDbContext _context;

    public ProductionSlotService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductionSlot>> GetSlotsAsync(DateOnly startDate, DateOnly endDate)
    {
        return await _context.ProductionSlots
            .Where(s => s.Date >= startDate && s.Date <= endDate)
            .OrderBy(s => s.Date)
            .ToListAsync();
    }
}
