// Student name: ____________________
// TVET Database Management (DB3) | Session 01 - First ADO.NET Console connection
// Prerequisites: .NET SDK, SQL Server/LocalDB, and the supplied SQL setup script.
// Install provider: dotnet add package Microsoft.Data.SqlClient
using Microsoft.Data.SqlClient;

// LocalDB is Windows-only. Ask your instructor for a different instance if needed.
// Do not commit passwords or production connection strings to GitHub.
string cs = @"Server=(localdb)\MSSQLLocalDB;
Database=TVET_DBM_Lab01;
Integrated Security=True;Encrypt=True;
TrustServerCertificate=True";

// Step 1: Describe the target SQL Server connection.
await using var connection = new SqlConnection(cs);
// Step 2: Open the connection to the server.
await connection.OpenAsync();
Console.WriteLine("Connected to SQL Server.");

// Step 3: Prepare a read-only SQL command with no user input.
const string sql = "SELECT COUNT(*) FROM dbo.Students";
await using var command = new SqlCommand(sql, connection);

// Step 4: Fetch a single number. Explain this in your own comment here:
int total = Convert.ToInt32(await command.ExecuteScalarAsync());
Console.WriteLine($"Total students: {total}");
// 'await using' disposes command and connection when the scope ends.
