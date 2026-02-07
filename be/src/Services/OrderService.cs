using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

using cake_store_api.Data;
using cake_store_api.DTOs;
using cake_store_api.Entities;
using cake_store_api.Enums;
using cake_store_api.Exceptions;
using cake_store_api.Interfaces;
using cake_store_api.Mappings;

namespace cake_store_api.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly IDeliveryEstimatorService _deliveryEstimator;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public OrderService(AppDbContext context, IDeliveryEstimatorService deliveryEstimator, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _deliveryEstimator = deliveryEstimator;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task AdvanceStatusAsync(Guid orderId, OrderStatus newStatus)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) throw new NotFoundException($"Order {orderId} not found");

        order.Status = newStatus;
        await _context.SaveChangesAsync();
    }

    public async Task<CreateOrderResponse> PlaceOrderAsync(CreateOrderRequest request)
    {
        // 1. Get User ID if logged in
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // 2. Validate Cart & Stock
        // var validation = await _deliveryEstimator.ValidateCartItemsAsync(request.Items);
        // if (!validation.IsValid)
        // {
        //     throw new InventoryException(string.Join(", ", validation.Errors));
        // }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var productIds = request.Items.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            var order = new Order
            {
                UserId = userId,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
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

                    var slot = await _context.ProductionSlots
                        .FirstOrDefaultAsync(s => s.Date == targetDate);

                    if (slot == null)
                    {
                        slot = new ProductionSlot
                        {
                            Date = targetDate,
                            MaxCapacity = 50, // Default constraint
                            ReservedCapacity = 0
                        };
                        _context.ProductionSlots.Add(slot);
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
                    CustomizationData = null 
                });
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

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
        return await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetOrdersByUserIdAsync(string userId)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.CreatedAt,
                o.Status.ToString(),
                o.TotalAmount,
                o.Items.Count
            ))
            .ToListAsync();
    }

    // Admin methods
    public async Task<PaginatedResult<Order>> GetOrdersWithFilterAsync(OrderFilterRequest filter)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .AsQueryable();

        // Apply filters
        if (filter.Status.HasValue)
        {
            query = query.Where(o => o.Status == filter.Status.Value);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(o => o.CreatedAt >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(o => o.CreatedAt <= filter.EndDate.Value);
        }

        if (!string.IsNullOrEmpty(filter.CustomerEmail))
        {
            query = query.Where(o => o.CustomerEmail != null && o.CustomerEmail.Contains(filter.CustomerEmail));
        }

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        return new PaginatedResult<Order>(
            orders,
            totalCount,
            filter.Page,
            filter.PageSize,
            totalPages
        );
    }

    public async Task<OrderStatsDto> GetOrderStatsAsync()
    {
        var orders = await _context.Orders.ToListAsync();

        return new OrderStatsDto(
            TotalOrders: orders.Count,
            NewOrders: orders.Count(o => o.Status == OrderStatus.New),
            ProcessingOrders: orders.Count(o => o.Status == OrderStatus.Production),
            CompletedOrders: orders.Count(o => o.Status == OrderStatus.Completed),
            CancelledOrders: orders.Count(o => o.Status == OrderStatus.Cancelled),
            TotalRevenue: orders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalAmount)
        );
    }

    public async Task UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus)
    {
        await AdvanceStatusAsync(orderId, newStatus);
    }
}
