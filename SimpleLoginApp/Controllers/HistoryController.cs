using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleLoginApp.Data;
using SimpleLoginApp.Models;
using System.Text.RegularExpressions;

namespace SimpleLogin.Controllers
{
    [ApiController]
    [Route("api/history")]
    public class HistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoryController(AppDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // GET: /api/history/reference
        // =========================================================

        [HttpGet("reference")]
        public async Task<IActionResult> GetReference()
        {
            int? userId =
                HttpContext.Session.GetInt32("UserId");


            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "You are not logged in."
                });
            }


            var existingHistory =
                await _context.PatientHistories
                    .AsNoTracking()
                    .Where(h =>
                        h.CreatedByUserId == userId.Value)
                    .OrderBy(h => h.Id)
                    .FirstOrDefaultAsync();


            if (existingHistory != null)
            {
                return Ok(new
                {
                    referenceNumber =
                        existingHistory.ReferenceNumber
                });
            }


            DateTime today =
                DateTime.Today;


            int lastSequence =
                await _context.PatientHistories
                    .Where(h =>
                        h.ReferenceSequence > 0)
                    .Select(h =>
                        (int?)h.ReferenceSequence)
                    .MaxAsync() ?? 0;


            int nextSequence =
                lastSequence + 1;


            string referenceNumber =
                GenerateReferenceNumber(
                    today,
                    nextSequence
                );


            return Ok(new
            {
                referenceNumber =
                    referenceNumber,

                referenceSequence =
                    nextSequence
            });
        }


        // =========================================================
        // GET: /api/history/my-history
        // =========================================================

        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyHistory()
        {
            int? userId =
                HttpContext.Session.GetInt32("UserId");


            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "You are not logged in."
                });
            }


            var history =
                await _context.PatientHistories
                    .AsNoTracking()
                    .Where(h =>
                        h.CreatedByUserId == userId.Value)
                    .OrderByDescending(h => h.Id)
                    .FirstOrDefaultAsync();


            if (history == null)
            {
                return Ok(new
                {
                    exists = false
                });
            }


            return Ok(new
            {
                exists = true,

                id = history.Id,

                referenceNumber =
                    history.ReferenceNumber,

                entryDate =
                    history.EntryDate
                        .ToString("yyyy-MM-dd"),

                patientName =
                    history.PatientName,

                dob =
                    history.DOB
                        .ToString("yyyy-MM-dd"),

                mobile =
                    history.Mobile,

                email =
                    history.Email,

                bloodGroup =
                    history.BloodGroup,

                procedureName =
                    history.ProcedureName,

                referredBy =
                    history.ReferredBy,

                chiefComplaint =
                    history.ChiefComplaint
            });
        }


        // =========================================================
        // GET: /api/history/search
        //
        // ONE SEARCH FIELD
        //
        // User can enter:
        //
        // Rahul Kumar
        //
        // OR
        //
        // TEC15092026/01AB
        //
        // =========================================================

        [HttpGet("search")]
        public async Task<IActionResult> SearchHistory(
            [FromQuery] string? search)
        {
            // -----------------------------------------------------
            // SESSION CHECK
            // -----------------------------------------------------

            int? userId =
                HttpContext.Session.GetInt32("UserId");


            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "You are not logged in."
                });
            }


            // -----------------------------------------------------
            // CHECK EMPTY SEARCH
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(search))
            {
                return BadRequest(new
                {
                    message =
                        "Please enter a patient name or reference number."
                });
            }


            // Remove extra spaces
            search =
                search.Trim();


            // -----------------------------------------------------
            // ALLOWED CHARACTERS
            //
            // Patient name:
            // A-Z and spaces
            //
            // Reference:
            // A-Z, numbers and /
            // -----------------------------------------------------

            if (!Regex.IsMatch(
                search,
                @"^[A-Za-z0-9 /]+$"))
            {
                return BadRequest(new
                {
                    message =
                        "Search can contain only letters, numbers, spaces and '/'."
                });
            }


            // -----------------------------------------------------
            // DETERMINE SEARCH TYPE
            // -----------------------------------------------------

            bool looksLikeReference =
                Regex.IsMatch(
                    search,
                    @"^TEC\d{8}/\d{2}[A-Za-z]{2}$",
                    RegexOptions.IgnoreCase
                );


            // -----------------------------------------------------
            // START DATABASE QUERY
            // -----------------------------------------------------

            IQueryable<PatientHistory> query =
                _context.PatientHistories
                    .AsNoTracking();


            // =====================================================
            // REFERENCE NUMBER SEARCH
            // =====================================================

            if (looksLikeReference)
            {
                string reference =
                    search.ToUpperInvariant();


                query =
                    query.Where(h =>
                        h.ReferenceNumber != null &&
                        h.ReferenceNumber.ToUpper() == reference);
            }


            // =====================================================
            // PATIENT NAME SEARCH
            // =====================================================

            else
            {
                // A patient name should contain
                // alphabets and spaces only.

                if (!Regex.IsMatch(
                    search,
                    @"^[A-Za-z ]+$"))
                {
                    return BadRequest(new
                    {
                        message =
                            "Enter a valid patient name or reference number."
                    });
                }


                string patientName =
                    search.ToLower();


                query =
                    query.Where(h =>
                        h.PatientName != null &&
                        h.PatientName.ToLower()
                            .Contains(patientName));
            }


            // -----------------------------------------------------
            // GET RESULTS
            // -----------------------------------------------------

            var results =
                await query
                    .OrderBy(h =>
                        h.PatientName)
                    .Select(h => new
                    {
                        id =
                            h.Id,

                        referenceNumber =
                            h.ReferenceNumber,

                        entryDate =
                            h.EntryDate
                                .ToString("yyyy-MM-dd"),

                        patientName =
                            h.PatientName,

                        dob =
                            h.DOB
                                .ToString("yyyy-MM-dd"),

                        mobile =
                            h.Mobile,

                        email =
                            h.Email,

                        bloodGroup =
                            h.BloodGroup,

                        procedureName =
                            h.ProcedureName,

                        referredBy =
                            h.ReferredBy,

                        chiefComplaint =
                            h.ChiefComplaint
                    })
                    .ToListAsync();


            // -----------------------------------------------------
            // RETURN RESULTS
            // -----------------------------------------------------

            return Ok(new
            {
                count =
                    results.Count,

                results =
                    results
            });
        }


        // =========================================================
        // POST: /api/history/save
        // =========================================================

        [HttpPost("save")]
        public async Task<IActionResult> SaveHistory(
            [FromBody] PatientHistory history)
        {
            int? userId =
                HttpContext.Session.GetInt32("UserId");


            if (userId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "You are not logged in."
                });
            }


            // -----------------------------------------------------
            // NULL CHECK
            // -----------------------------------------------------

            if (history == null)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid history data."
                });
            }

            // =====================================================
            // ENTRY DATE VALIDATION
            // Only TODAY or YESTERDAY is allowed
            // =====================================================

            DateTime today = DateTime.Today;

            DateTime yesterday = today.AddDays(-1);

            DateTime selectedEntryDate =
                history.EntryDate.Date;


            if (selectedEntryDate != today && selectedEntryDate != yesterday)
            {
                return BadRequest(new
                {
                    message =
                        "Entry date can only be today or yesterday."
                });
            }

            // -----------------------------------------------------
            // PATIENT NAME
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                history.PatientName))
            {
                return BadRequest(new
                {
                    message =
                        "Patient name is required."
                });
            }


            if (!Regex.IsMatch(
                history.PatientName,
                @"^[A-Za-z ]+$"))
            {
                return BadRequest(new
                {
                    message =
                        "Patient name can contain only alphabets and spaces."
                });
            }


            history.PatientName =
                history.PatientName.Trim();


            // -----------------------------------------------------
            // MOBILE
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                history.Mobile))
            {
                return BadRequest(new
                {
                    message =
                        "Mobile number is required."
                });
            }


            if (!Regex.IsMatch(
                history.Mobile,
                @"^[6-9][0-9]{9}$"))
            {
                return BadRequest(new
                {
                    message =
                        "Mobile number must contain exactly 10 digits and start with 6, 7, 8 or 9."
                });
            }


            // -----------------------------------------------------
            // EMAIL
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                history.Email))
            {
                return BadRequest(new
                {
                    message =
                        "Email is required."
                });
            }


            if (!Regex.IsMatch(
                history.Email,
                @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest(new
                {
                    message =
                        "Please enter a valid email address."
                });
            }


            // -----------------------------------------------------
            // DOB
            // -----------------------------------------------------

            DateTime btoday =
                DateTime.Today;


            DateTime youngestAllowedDob =
                btoday
                    .AddYears(-10)
                    .AddDays(-1);


            DateTime oldestAllowedDob =
                btoday
                    .AddYears(-100)
                    .AddDays(1);


            if (
                history.DOB < oldestAllowedDob ||
                history.DOB > youngestAllowedDob
            )
            {
                return BadRequest(new
                {
                    message =
                        "Patient age must be more than 10 years and less than 100 years."
                });
            }


            // -----------------------------------------------------
            // BLOOD GROUP
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                history.BloodGroup))
            {
                return BadRequest(new
                {
                    message =
                        "Blood group is required."
                });
            }


            // -----------------------------------------------------
            // PROCEDURE
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                history.ProcedureName))
            {
                return BadRequest(new
                {
                    message =
                        "Procedure name is required."
                });
            }


            // -----------------------------------------------------
            // CHIEF COMPLAINT
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                history.ChiefComplaint))
            {
                return BadRequest(new
                {
                    message =
                        "Chief complaint is required."
                });
            }


            // -----------------------------------------------------
            // FIND EXISTING HISTORY
            // -----------------------------------------------------

            var existingHistory =
                await _context.PatientHistories
                    .FirstOrDefaultAsync(h =>
                        h.CreatedByUserId ==
                        userId.Value);


            // -----------------------------------------------------
            // UPDATE EXISTING RECORD
            // -----------------------------------------------------

            if (existingHistory != null)
            {
                existingHistory.PatientName =
                    history.PatientName;

                existingHistory.DOB =
                    history.DOB;

                existingHistory.Mobile =
                    history.Mobile;

                existingHistory.Email =
                    history.Email;

                existingHistory.BloodGroup =
                    history.BloodGroup;

                existingHistory.ProcedureName =
                    history.ProcedureName;

                existingHistory.ReferredBy =
                    history.ReferredBy;

                existingHistory.ChiefComplaint =
                    history.ChiefComplaint;


                await _context.SaveChangesAsync();


                return Ok(new
                {
                    message =
                        "History updated successfully.",

                    referenceNumber =
                        existingHistory.ReferenceNumber
                });
            }


            // -----------------------------------------------------
            // CREATE NEW RECORD
            // -----------------------------------------------------

            DateTime referenceDate =
                DateTime.Today;


            int lastSequence =
                await _context.PatientHistories
                    .Where(h =>
                        h.ReferenceSequence > 0)
                    .Select(h =>
                        (int?)h.ReferenceSequence)
                    .MaxAsync() ?? 0;


            int nextSequence =
                lastSequence + 1;


            string referenceNumber =
                GenerateReferenceNumber(
                    referenceDate,
                    nextSequence
                );


            history.ReferenceNumber =
                referenceNumber;


            history.ReferenceSequence =
                nextSequence;


            history.EntryDate =
                DateTime.Today;


            history.CreatedByUserId =
                userId.Value;


            _context.PatientHistories.Add(
                history
            );


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "History saved successfully.",

                referenceNumber =
                    history.ReferenceNumber
            });
        }


        // =========================================================
        // GENERATE REFERENCE NUMBER
        // =========================================================

        private string GenerateReferenceNumber(
            DateTime date,
            int sequence)
        {
            string datePart =
                date.ToString("ddMMyyyy");


            string sequencePart =
                sequence.ToString("D2");


            string lettersPart =
                GetReferenceLetters(
                    sequence
                );


            return
                $"TEC{datePart}/{sequencePart}{lettersPart}";
        }


        // =========================================================
        // GENERATE REFERENCE LETTERS
        // =========================================================

        private string GetReferenceLetters(
            int sequence)
        {
            const string letters =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


            int value =
                sequence - 1;


            int firstIndex =
                value / 26;


            int secondIndex =
                value % 26;


            firstIndex %= 26;


            return
                $"{letters[firstIndex]}{letters[secondIndex]}";
        }
    }
}