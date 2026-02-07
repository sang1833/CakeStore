using cake_store_api.Entities;
using cake_store_api.DTOs;
using cake_store_api.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using cake_store_api.Data;

namespace cake_store_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public AdminController(UserManager<ApplicationUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpPost("users/{userId}/assign-admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AssignAdminRole(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { Message = "User not found" });
        }

        var result = await _userManager.AddToRoleAsync(user, "Admin");
        if (result.Succeeded)
        {
            return Ok(new { Message = $"Admin role assigned to {user.Email}" });
        }

        return BadRequest(result.Errors);
    }

    [HttpGet("users")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PaginatedResult<UserListDto>>> GetUsers([FromQuery] UserFilterRequest filter)
    {
        var query = _userManager.Users.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(filter.Email))
        {
            query = query.Where(u => u.Email != null && u.Email.Contains(filter.Email));
        }

        if (filter.IsBlocked.HasValue)
        {
            if (filter.IsBlocked.Value)
            {
                query = query.Where(u => u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow);
            }
            else
            {
                query = query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow);
            }
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.Email)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var userDtos = new List<UserListDto>();
        foreach (var user in users)
        {
            var orderCount = await _context.Orders.CountAsync(o => o.UserId == user.Id);
            var isBlocked = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow;
            
            userDtos.Add(new UserListDto(
                user.Id,
                user.Email!,
                user.FullName,
                user.PhoneNumber,
                isBlocked,
                user.LockoutEnd?.DateTime,
                orderCount
            ));
        }

        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        return Ok(new PaginatedResult<UserListDto>(
            userDtos,
            totalCount,
            filter.Page,
            filter.PageSize,
            totalPages
        ));
    }

    [HttpGet("users/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDetailDto>> GetUserDetails(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "User not found" });
        }

        var orders = await _context.Orders
            .Where(o => o.UserId == id)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.CreatedAt,
                o.Status.ToString(),
                o.TotalAmount,
                o.Items.Count
            ))
            .ToListAsync();

        var isBlocked = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow;

        var userDetail = new UserDetailDto(
            user.Id,
            user.Email!,
            user.FullName,
            user.PhoneNumber,
            user.Address,
            isBlocked,
            user.LockoutEnd?.DateTime,
            orders
        );

        return Ok(userDetail);
    }

    [HttpPatch("users/{id}/block")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> BlockUser(string id, [FromQuery] bool block = true)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "User not found" });
        }

        if (block)
        {
            // Block user for 100 years (permanent block)
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
            await _userManager.SetLockoutEnabledAsync(user, true);
        }
        else
        {
            // Unblock user
            await _userManager.SetLockoutEndDateAsync(user, null);
        }

        var action = block ? "blocked" : "unblocked";
        return Ok(new { Message = $"User {user.Email} has been {action}" });
    }

    // Dashboard endpoints
    [HttpGet("dashboard/summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
    {
        var today = DateTime.UtcNow.Date;

        var completedOrders = await _context.Orders
            .Where(o => o.Status == OrderStatus.Completed)
            .ToListAsync();

        var totalRevenue = completedOrders.Sum(o => o.TotalAmount);
        var totalOrders = await _context.Orders.CountAsync();
        var todayOrders = await _context.Orders.CountAsync(o => o.CreatedAt.Date == today);
        var pendingOrders = await _context.Orders.CountAsync(o => 
            o.Status == OrderStatus.New || o.Status == OrderStatus.Production);

        // Top 5 products by order count
        var topProducts = await _context.Orders
            .Where(o => o.Status == OrderStatus.Completed)
            .SelectMany(o => o.Items)
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new TopProductDto(
                g.Key.ProductId,
                g.Key.ProductName,
                g.Count(),
                g.Sum(i => i.Price * i.Quantity)
            ))
            .OrderByDescending(p => p.OrderCount)
            .Take(5)
            .ToListAsync();

        var summary = new DashboardSummaryDto(
            totalRevenue,
            totalOrders,
            todayOrders,
            pendingOrders,
            topProducts
        );

        return Ok(summary);
    }

    [HttpGet("dashboard/recent-orders")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<OrderSummaryDto>>> GetRecentOrders()
    {
        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.CreatedAt,
                o.Status.ToString(),
                o.TotalAmount,
                o.Items.Count
            ))
            .ToListAsync();

        return Ok(recentOrders);
    }

    // Production Slot Management
    [HttpGet("slots")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<ProductionSlotDto>>> GetProductionSlots([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate)
    {
        var query = _context.ProductionSlots.AsQueryable();

        // Default to next 30 days if no dates provided
        var start = startDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var end = endDate ?? start.AddDays(30);

        var slots = await query
            .Where(s => s.Date >= start && s.Date <= end)
            .OrderBy(s => s.Date)
            .ToListAsync();

        var slotDtos = slots.Select(s => new ProductionSlotDto(
            s.Date,
            s.MaxCapacity,
            s.ReservedCapacity,
            s.MaxCapacity - s.ReservedCapacity
        )).ToList();

        return Ok(slotDtos);
    }

    [HttpPut("slots/{date}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ProductionSlotDto>> UpdateSlotCapacity(DateOnly date, [FromBody] UpdateSlotRequest request)
    {
        var slot = await _context.ProductionSlots.FindAsync(date);
        if (slot == null)
        {
            return NotFound(new { Message = $"Production slot for {date} not found" });
        }

        slot.MaxCapacity = request.MaxCapacity;
        await _context.SaveChangesAsync();

        var updatedSlot = new ProductionSlotDto(
            slot.Date,
            slot.MaxCapacity,
            slot.ReservedCapacity,
            slot.MaxCapacity - slot.ReservedCapacity
        );

        return Ok(updatedSlot);
    }
}
