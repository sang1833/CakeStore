namespace cake_store_api.DTOs;

public record UserProfileDto(string Id, string Email, string FullName, string Phone, string Address);
public record UpdateProfileRequest(string FullName, string Phone, string Address);

// Admin DTOs
public record UserListDto(
    string Id,
    string Email,
    string? FullName,
    string? PhoneNumber,
    bool IsBlocked,
    DateTime? LockoutEnd,
    int OrderCount
);

public record UserDetailDto(
    string Id,
    string Email,
    string? FullName,
    string? PhoneNumber,
    string? Address,
    bool IsBlocked,
    DateTime? LockoutEnd,
    List<OrderSummaryDto> Orders
);

public record UserFilterRequest(
    string? Email,
    bool? IsBlocked,
    int Page = 1,
    int PageSize = 10
);
