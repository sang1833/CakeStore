using System;
using System.Linq;
// using System.Text.Json;
// using System.Text.Json.Nodes;
using cake_store_api.Data;
using cake_store_api.DTOs;
using cake_store_api.Entities;
using cake_store_api.Enums;
using Microsoft.EntityFrameworkCore;

using cake_store_api.Interfaces;
using cake_store_api.Exceptions;
using cake_store_api.Mappings;

namespace cake_store_api.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _dbContext;

    public OrderService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AdvanceStatusAsync(Guid orderId, OrderStatus newStatus)
    {
        var order = await _dbContext.Orders.FindAsync(orderId);
        if (order == null) throw new NotFoundException($"Order {orderId} not found");

        order.Status = newStatus;
        await _dbContext.SaveChangesAsync();
    }

    public async Task<CreateOrderResponse> PlaceOrderAsync(CreateOrderRequest request)
    {
        // 1. Transaction
        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var productIds = request.Items.Select(i => i.ProductId).ToList();
            var products = await _dbContext.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            var order = new Order
            {
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                ShippingAddress = request.ShippingAddress,
                DeliveryDate = request.DesiredDeliveryDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc), 
                Status = OrderStatus.New
            };

            foreach (var itemDto in request.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == itemDto.ProductId);
                if (product == null) throw new NotFoundException($"Product {itemDto.ProductId} not found");

                // Inventory Check & Reservation
                if (product is ReadyToShipProduct typeA)
                {
                    // Update Stock
                    if (typeA.StockQuantity < itemDto.Quantity)
                    {
                        throw new InventoryException($"Insufficient stock for {typeA.Name}");
                    }
                    typeA.StockQuantity -= itemDto.Quantity;
                }
                else if (product is MakeToOrderProduct typeB)
                {
                    DateOnly targetDate = request.DesiredDeliveryDate;

                    var slot = await _dbContext.ProductionSlots
                        .FirstOrDefaultAsync(s => s.Date == targetDate);

                    if (slot == null)
                    {
                        slot = new ProductionSlot
                        {
                            Date = targetDate,
                            MaxCapacity = 50, // Default constraint
                            ReservedCapacity = 0
                        };
                        _dbContext.ProductionSlots.Add(slot);
                    }

                    if (slot.ReservedCapacity + itemDto.Quantity > slot.MaxCapacity)
                    {
                        throw new InventoryException($"Production capacity exceeded for {targetDate}");
                    }

                    slot.ReservedCapacity += itemDto.Quantity;
                }

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Price = product.Price,
                    Quantity = itemDto.Quantity,
                    CustomizationData = null // itemDto.CustomizationData != null ? JsonNode.Parse(itemDto.CustomizationData) : null
                });
            }

            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return order.ToCreateOrderResponse();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<Order>> GetOrdersAsync()
    {
        return await _dbContext.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(Guid id)
    {
        return await _dbContext.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }
}
