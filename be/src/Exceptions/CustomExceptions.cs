namespace cake_store_api.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}

public class InventoryException : Exception
{
    public InventoryException(string message) : base(message)
    {
    }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message)
    {
    }
}
