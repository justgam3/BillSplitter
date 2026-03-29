# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# Copy solution file
COPY BillSplitter.slnx .

# Copy project files for restore
COPY src/BillSplitter.Domain/*.csproj src/BillSplitter.Domain/
COPY src/BillSplitter.Application/*.csproj src/BillSplitter.Application/
COPY src/BillSplitter.Infrastructure/*.csproj src/BillSplitter.Infrastructure/
COPY src/BillSplitter.API/*.csproj src/BillSplitter.API/

# Restore dependencies
RUN dotnet restore src/BillSplitter.API/BillSplitter.API.csproj

# Copy everything else
COPY src/ src/

# Build and publish
WORKDIR /source/src/BillSplitter.API
RUN dotnet publish -c Release -o /app --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copy published files from build stage
COPY --from=build /app .

# Render provides PORT environment variable (default 5000 for local testing)
ENV ASPNETCORE_URLS=http://+:${PORT:-5000}
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port (for documentation, Render ignores this)
EXPOSE ${PORT:-5000}

ENTRYPOINT ["dotnet", "BillSplitter.API.dll"]
