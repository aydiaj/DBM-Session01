-- TVET Database Management · Session 01 · safe setup for SQL Server / SSMS
-- Requires permission to create a database if it does not already exist.
IF DB_ID(N'TVET_DBM_Lab01') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE TVET_DBM_Lab01');
END;
GO
USE TVET_DBM_Lab01;
GO
-- Avoid overwriting any student data if this script is run again.
IF OBJECT_ID(N'dbo.Students', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Students
    (
        StudentId INT NOT NULL PRIMARY KEY,
        FullName NVARCHAR(80) NOT NULL,
        Program NVARCHAR(80) NOT NULL
    );
END;
GO
IF NOT EXISTS (SELECT 1 FROM dbo.Students WHERE StudentId = 1)
    INSERT INTO dbo.Students (StudentId, FullName, Program)
    VALUES (1, N'Lina', N'Programming');
IF NOT EXISTS (SELECT 1 FROM dbo.Students WHERE StudentId = 2)
    INSERT INTO dbo.Students (StudentId, FullName, Program)
    VALUES (2, N'Omar', N'Networking');
IF NOT EXISTS (SELECT 1 FROM dbo.Students WHERE StudentId = 3)
    INSERT INTO dbo.Students (StudentId, FullName, Program)
    VALUES (3, N'Reem', N'Database');
GO
SELECT StudentId, FullName, Program FROM dbo.Students ORDER BY StudentId;
GO
