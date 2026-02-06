using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using cake_store_api.Data;
using cake_store_api.Entities;
using Microsoft.EntityFrameworkCore;
using cake_store_api.DTOs;
using cake_store_api.Interfaces;

namespace cake_store_api.Services;

public class DeliveryEstimatorService : IDeliveryEstimatorService
{
    private readonly AppDbContext _dbContext;

    public DeliveryEstimatorService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // This is the new method added by the user's instruction.
    // It delegates to an internal or overloaded ValidateCartAsync.
    // public async Task<(bool IsValid, List<string> Errors)> ValidateCartItemsAsync(List<CreateOrderItemDto> items)
    // {
    //     // This assumes an overload or internal method exists that takes List<(Guid ProductId, int Quantity)>
    //     // For now, let's implement a basic validation for the internal method.
    //     var result = await ValidateCartAsync(items.Select(i => (i.ProductId, i.Quantity)).ToList());
    //     return result;
    // }

    // This is the internal/overloaded method that the above ValidateCartAsync calls.
    // This implementation is a placeholder and should be filled with actual validation logic.
    public async Task<(bool IsValid, List<string> Errors)> ValidateCartAsync(List<(Guid ProductId, int Quantity)> items)
    {
        var errors = new List<string>();
        bool isValid = true;

        var productIds = items.Select(x => x.ProductId).ToList();
        var products = await _dbContext.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        foreach (var item in items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null)
            {
                errors.Add($"Product with ID {item.ProductId} not found.");
                isValid = false;
            }
            else
            {
                // Example validation: quantity must be positive
                if (item.Quantity <= 0)
                {
                    errors.Add($"Quantity for product {product.Name} (ID: {item.ProductId}) must be positive.");
                    isValid = false;
                }

                // Add more validation rules here, e.g., stock checks for ReadyToShipProduct
                if (product is ReadyToShipProduct rtsProduct)
                {
                    if (rtsProduct.StockQuantity < item.Quantity)
                    {
                        errors.Add($"Not enough stock for {rtsProduct.Name}. Available: {rtsProduct.StockQuantity}, Requested: {item.Quantity}.");
                        isValid = false;
                    }
                }
                // For MakeToOrderProduct, you might validate if lead time is reasonable, etc.
            }
        }

        return (isValid, errors);
    }
    
    public async Task<DateOnly> EstimateDeliveryDateAsync(List<(Guid ProductId, int Quantity)> items)
    {
        var productIds = items.Select(x => x.ProductId).ToList();
        var products = await _dbContext.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        var now = DateTime.UtcNow; // Or inject IClock for testing
        // Logic Rule 2 (Cut-off): If Now > 18:00, "Today" for planning purposes effectively ends, 
        // effectively pushing base start time for production.
        // Or strictly: if Now > 18:00, MakeToOrder earliest slot cannot be T+1, starts T+2.
        bool pastCutOff = now.Hour >= 18;

        DateOnly minDate = DateOnly.FromDateTime(now);
        
        // If past cutoff, any Type B order treats "Tomorrow" as the first potential production start?
        // Let's refine based on spec: "MinimumDate for Type B orders shifts to T+2 days (skipping T+1)."
        
        DateOnly typeBBaseDate = DateOnly.FromDateTime(now.AddDays(pastCutOff ? 2 : 1));
        
        DateOnly maxRequiredDate = DateOnly.FromDateTime(now);

        // Separate items by type logic
        foreach (var item in items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null) continue;

            if (product is ReadyToShipProduct)
            {
                // Type A: Standard delivery time (e.g. T+0 if instant, or T+1).
                // Spec says "ReadyToShip items (Stock decrement)". No lead time mentioned explicitly implies immediate or standard shipping.
                // SRS 3.2: "EarliestTime = Max(TypeA_StandardTime, Max(TypeB_Items_LeadTime))"
                // Let's assume Type AS standard time is Today (if ordered early) or Tomorrow.
                // Let's assume T+1 for Type A for simplicity unless instant.
                DateOnly typeADate = DateOnly.FromDateTime(now.AddDays(1));
                if (typeADate > maxRequiredDate) maxRequiredDate = typeADate;
            }
            else if (product is MakeToOrderProduct typeB)
            {
                // Type B: Logic
                // 1. Calculate LeadTime based date
                // LeadTime is in hours.
                // Earliest ready time = Now + LeadTime.
                DateTime earliestReadyTime = now.AddHours(typeB.LeadTimeHours);
                DateOnly readyDate = DateOnly.FromDateTime(earliestReadyTime);
                
                // Consolidate with CutOff rule (business logic constraint overrides pure lead time)
                if (readyDate < typeBBaseDate)
                {
                    readyDate = typeBBaseDate;
                }

                // 2. Logic Rule 3 (Capacity)
                // We need to check ProductionSlot for 'readyDate'.
                // If full, move next day.
                // Note: Querying capacity for EACH item in loop is inefficient (N+1). 
                // Should batch checking capacity?
                // For MVP/Plan, we check individually or optimize.
                // Also, "If Reserved + Request > Max, find next available".
                
                // Optimization: We need to find a single valid date for the whole order? 
                // Or separate? "Constraint: If Cart contains Type B, user MUST select a specific Date/Time Slot." 
                // So we just need to return the *Earliest* possible date that satisfies all.
                
                // Let's find slot for this specific item quantity first?
                // Actually capacity is global for the day (Simplified MRP).
                // We sum up Type B quantity for the order? Or per item?
                // Assuming capacity is "Units of Cake" per day.
                // We shouldn't book it yet, just check availability.
                
                // Check capacity for readyDate
                bool slotFound = false;
                while (!slotFound)
                {
                   var slot = await _dbContext.ProductionSlots
                       .Where(s => s.Date == readyDate)
                       .Select(s => new { s.ReservedCapacity, s.MaxCapacity })
                       .FirstOrDefaultAsync();

                   // Default capacity if no slot exists? 
                   // Assume separate seed or dynamic creation?
                   // If no slot exists, implies 0 capacity or infinite? 
                   // Let's assume: If no slot record, we can't book? Or we create one?
                   // Usually implies we have a calendar.
                   // Let's assume default capacity if null, or strictly require slot.
                   // For now: assume strictly require slot -> if null, can't book -> next day?
                   // Or simplified: No slot = Open day (Max capacity = default)?
                   // Safe bet: No slot = 0 capacity (closed).
                   
                   int currentReserved = slot?.ReservedCapacity ?? 0;
                   int maxCap = slot?.MaxCapacity ?? 0; // If slot missing, capacity 0 -> skip day
                   
                   // Exception: If we decide auto-create slots, logic changes.
                   // Plan said "ProductionSlot (Aggregate Root): Represents manufacturing capacity".
                   // Let's assume we need to find a day with (Reserved + item.Quantity <= Max).
                   
                   if (currentReserved + item.Quantity <= maxCap)
                   {
                       slotFound = true; 
                       // Check if this date pushes the Order Max
                       if (readyDate > maxRequiredDate) maxRequiredDate = readyDate;
                   }
                   else
                   {
                       readyDate = readyDate.AddDays(1); // Try next day
                   }
                   
                   // Safety break
                   if (readyDate > DateOnly.FromDateTime(now.AddDays(30))) break; 
                }
            }
        }
        
        return maxRequiredDate;
    }
}
