# Use the official .NET text image as a build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["cake-store-api.csproj", "./"]
RUN dotnet restore "./cake-store-api.csproj"

# Copy the remaining source code
COPY . .
WORKDIR "/src/."
RUN dotnet build "cake-store-api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "cake-store-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "cake-store-api.dll"]
