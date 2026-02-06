namespace cake_store_api.DTOs;

public record UserProfileDto(string Id, string Email, string FullName, string Phone, string Address);
public record UpdateProfileRequest(string FullName, string Phone, string Address);
