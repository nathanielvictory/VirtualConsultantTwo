using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using api.Data;
using api.Infrastructure;
using api.Models;
using api.Middleware;
using api.Messaging.RabbitMq;
using api.Messaging.Abstractions;
using Microsoft.AspNetCore.HttpLogging;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        .UseSnakeCaseNamingConvention()
);

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services
    .AddIdentityCore<User>(opts =>
    {
        // keep passwords simple for dev; tighten later
        opts.Password.RequiredLength = 8;
        opts.Password.RequireDigit = false;
        opts.Password.RequireLowercase = false;
        opts.Password.RequireUppercase = false;
        opts.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole<int>>()                    // future-proof (roles later)
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

// JWT Bearer
var jwt = builder.Configuration.GetSection("Jwt");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VC API", Version = "v1" });
    c.EnableAnnotations();
    // OAuth2 (Password grant) pointing at /api/auth/token
    c.AddSecurityDefinition("OAuth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Description = "OAuth2 Password flow for local testing",
        Flows = new OpenApiOAuthFlows
        {
            Password = new OpenApiOAuthFlow
            {
                TokenUrl = new Uri("/api/auth/token", UriKind.Relative),
                Scopes = new Dictionary<string, string>
                {
                    { "api", "Access the API" }
                    // add more later if you enforce scopes, e.g.:
                    // { "projects:read", "Read projects" },
                    // { "projects:write", "Write projects" }
                }
            }
        }
    });

    // Require OAuth2 globally (you can still [AllowAnonymous] specific actions)
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "OAuth2"
                }
            },
            new[] { "api" }
        }
    });
});

builder.Services.AddAuthorization();
builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.AddSingleton<ITaskEventPublisher, RabbitMqTaskEventPublisher>();

builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "https://qa.virtualconsultant.victorymodeling.com",
                "https://virtualconsultant.victorymodeling.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // needed when using credentials: 'include'
    });
});

builder.Services.AddHttpLogging(o =>
{
    o.LoggingFields =
        HttpLoggingFields.RequestMethod |
        HttpLoggingFields.RequestPath |
        HttpLoggingFields.ResponseStatusCode;
});

var app = builder.Build();

await app.MigrateAndSeedAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VC API v1");
        // For password flow, no PKCE/redirect config needed.
    });
}
app.UseHttpLogging();
app.UseHttpsRedirection();
app.UseCors("AllowAll");

// pipeline
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<DbConstraintExceptionMiddleware>();

app.MapControllers();

app.Run();
