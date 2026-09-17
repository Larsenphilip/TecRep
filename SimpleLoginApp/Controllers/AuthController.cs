using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SimpleLoginApp.Data;
using SimpleLoginApp.Models;
using Microsoft.EntityFrameworkCore;


namespace SimpleLogin.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterRequest request)
    {


        // Check if username is empty
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest("Username cannot be empty");
        }


        // Check if password is empty
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Password cannot be empty");
        }


        // Check password minimum length
        if (request.Password.Length < 6)
        {
            return BadRequest("Password must be at least 6 characters");
        }


        // Check if username already exists
        var existingUser = _context.Users
            .FirstOrDefault(u => u.username == request.Username);

        if (existingUser != null)
        {
            return BadRequest("Username already exists");
        }


        var hasher = new PasswordHasher<User>();

        var user = new User();

        user.username = request.Username;

        user.role = request.Role;

        user.password = hasher.HashPassword(
            user,
            request.Password
        );

       

        _context.Users.Add(user);

        _context.SaveChanges();

        return Ok("Registration successful!");
    }


    // login 

    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        var user = _context.Users
            .FirstOrDefault(u => u.username == request.Username);

        if (user == null)
        {
            return Unauthorized("Invalid username or password");
        }

        var hasher = new PasswordHasher<User>();

        var result = hasher.VerifyHashedPassword(
            user,
            user.password,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid username or password");
        }

        // Create session
        HttpContext.Session.SetString("Username", user.username);
        HttpContext.Session.SetInt32("UserId", user.Id);

        return Ok("Login successful!");
    }


    // Forget Password

    [HttpPost("reset-password")]
    public IActionResult ResetPassword(ResetPasswordRequest request)
    {

        // Check if username is empty
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest("Username cannot be empty");
        }


        // Check if new password is empty
        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("Password cannot be empty");
        }


        // Check minimum password length
        if (request.NewPassword.Length < 6)
        {
            return BadRequest(
                "Password must be at least 6 characters"
            );
        }


        // Find the user using the username

        var user = _context.Users
            .FirstOrDefault(
                u => u.username == request.Username
            );


        // User does not exist

        if (user == null)
        {
            return NotFound("User not found");
        }


        // Create password hasher

        var hasher = new PasswordHasher<User>();


        // Hash the new password

        user.password =
            hasher.HashPassword(
                user,
                request.NewPassword
            );


        // Save the new password hash

        _context.SaveChanges();


        return Ok("Password reset successful!");
    }

    // Check Session 
    [HttpGet("check-session")]
    public IActionResult CheckSession()
    {
        var username = HttpContext.Session.GetString("Username");

        if (username == null)
        {
            return Unauthorized("You are not logged in");
        }

        return Ok(username);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();

        return Ok("Logged out successfully");
    }




}