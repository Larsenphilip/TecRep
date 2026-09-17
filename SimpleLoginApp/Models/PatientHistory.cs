using System.ComponentModel.DataAnnotations;

namespace SimpleLoginApp.Models
{
    public class PatientHistory
    {

        public int Id { get; set; }

        public string ReferenceNumber { get; set; } = "";
        public int ReferenceSequence { get; set; }

        [Required]
        public DateTime EntryDate { get; set; }

        [Required]
        public string PatientName { get; set; } = "";

        [Required]
        public DateTime DOB { get; set; }

        [Required]
        public string Mobile { get; set; } = "";

        [Required]
        public string Email { get; set; } = "";

        [Required]
        public string BloodGroup { get; set; } = "";

        [Required]
        public string ProcedureName { get; set; } = "";

        public string? ReferredBy { get; set; }

        [Required]
        public string ChiefComplaint { get; set; } = "";

        // User who created this history
        public int CreatedByUserId { get; set; }
    }
}
