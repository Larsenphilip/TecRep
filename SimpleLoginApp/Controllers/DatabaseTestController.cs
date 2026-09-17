using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SimpleLoginApp.Data;
using SimpleLoginApp.Models;
using Microsoft.EntityFrameworkCore;

namespace SimpleLogin.Controllers
{
    [ApiController]
    [Route("api/database-test")]
    public class DatabaseTestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DatabaseTestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("patient-history")]
        public async Task<IActionResult> CheckPatientHistory()
        {
            try
            {
                // Check whether EF Core can access the table
                bool canConnect = await _context.Database.CanConnectAsync();

                if (!canConnect)
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Could not connect to the database."
                    });
                }

                // Try to query PatientHistories
                int count = await _context.PatientHistories.CountAsync();

                return Ok(new
                {
                    success = true,
                    databaseConnection = true,
                    patientHistoryTable = true,
                    recordCount = count,
                    message = "PatientHistories table exists and can be accessed."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "PatientHistories table could not be accessed.",
                    error = ex.Message
                });
            }
        }
    }
}