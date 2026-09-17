using Microsoft.EntityFrameworkCore;
using SimpleLoginApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add controllers
builder.Services.AddControllers();

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession();

// Connect to SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var app = builder.Build();

// Allow the program to use files like HTML, CSS and JavaScript
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSession();

app.MapControllers();

app.Run();