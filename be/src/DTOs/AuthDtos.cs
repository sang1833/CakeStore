using System.ComponentModel.DataAnnotations;

namespace cake_store_api.DTOs;

public record RegisterRequest(
    [Required] string Email,
    [Required] string Password,
    [Required] string FullName,
    string? Address
);

public record LoginRequest(
    [Required] string Email,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    UserDto User
);

public record UserDto(
    string Id,
    string Email,
    string FullName
);

public record ForgotPasswordRequest(
    [Required] string Email
);

public record ResetPasswordRequest(
    [Required] string Email,
    [Required] string Token,
    [Required] string NewPassword
);
