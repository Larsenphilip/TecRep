using SimpleLoginApp.Models;
using Microsoft.EntityFrameworkCore;

namespace SimpleLoginApp.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options)   : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<PatientHistory> PatientHistories { get; set; }
    }
}
