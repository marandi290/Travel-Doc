# Travel-Doc — Database Setup and Migration Guide

This directory houses SQL Server schema scripts, migrations, and seed data for the **Travel-Doc** application.

---

## 1. Prerequisites
- **Microsoft SQL Server**: 2019, 2022, or 2025 (Standard, Enterprise, Developer, or Express editions).
- **sqlcmd** utility or **SQL Server Management Studio (SSMS)** / **Azure Data Studio**.

---

## 2. Directory Structure
```
database/
├── schema.sql         # Main DDL script to create database and tables
├── seed.sql           # Realistic sample destinations, wishlist items, visits, and photos
├── migrations/        # Incremental schema evolution scripts
└── README.md          # This setup guide
```

---

## 3. Quick Database Setup

### Option A: Using Windows PowerShell and sqlcmd (Recommended)
Run the automated schema runner or execute directly via `sqlcmd`:
```powershell
# Create database and tables
sqlcmd -S localhost -E -C -i database/schema.sql

# (Optional) Populate with realistic seed data
sqlcmd -S localhost -E -C -i database/seed.sql
```

> **Note on `-C` switch**: With SQL Server 2022/2025 and ODBC Driver 18+, the `-C` (Trust Server Certificate) switch is mandatory when connecting locally with self-signed SSL certificates.

### Option B: Using SQL Server Management Studio (SSMS)
1. Open SSMS and connect to `localhost` or your SQL Server instance.
2. Open `database/schema.sql` and click **Execute (F5)**.
3. Open `database/seed.sql` and click **Execute (F5)**.

---

## 4. Schema Verification
Verify that the database and tables were created:
```powershell
sqlcmd -S localhost -E -C -d TravelDocDB -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';"
```
Expected output:
- `Places`
- `WishlistItems`
- `Visits`
- `Photos`
