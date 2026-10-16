-- ============================================================================
-- Travel-Doc Database Schema Setup Script
-- Target DBMS: Microsoft SQL Server 2019 / 2022 / 2025
-- ============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Create Database if it does not exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TravelDocDB')
BEGIN
    CREATE DATABASE TravelDocDB;
    PRINT 'Database TravelDocDB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database TravelDocDB already exists.';
END
GO

USE TravelDocDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 2. Create Places Table
IF OBJECT_ID(N'dbo.Places', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Places (
        PlaceId UNIQUEIDENTIFIER CONSTRAINT DF_Places_PlaceId DEFAULT NEWID() NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Address NVARCHAR(500) NULL,
        City NVARCHAR(100) NULL,
        Country NVARCHAR(100) NOT NULL,
        Latitude DECIMAL(10, 7) NOT NULL,
        Longitude DECIMAL(10, 7) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Category NVARCHAR(50) CONSTRAINT DF_Places_Category DEFAULT N'Culture' NOT NULL,
        CreatedAt DATETIME2(3) CONSTRAINT DF_Places_CreatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        UpdatedAt DATETIME2(3) CONSTRAINT DF_Places_UpdatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        CONSTRAINT PK_Places PRIMARY KEY CLUSTERED (PlaceId ASC),
        CONSTRAINT CK_Places_Latitude CHECK (Latitude BETWEEN -90.0 AND 90.0),
        CONSTRAINT CK_Places_Longitude CHECK (Longitude BETWEEN -180.0 AND 180.0)
    );

    CREATE NONCLUSTERED INDEX IX_Places_Coords ON dbo.Places (Latitude, Longitude);
    CREATE NONCLUSTERED INDEX IX_Places_Country_City ON dbo.Places (Country, City);
    PRINT 'Table Places created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Places already exists.';
END
GO

-- 3. Create WishlistItems Table
IF OBJECT_ID(N'dbo.WishlistItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WishlistItems (
        WishlistItemId UNIQUEIDENTIFIER CONSTRAINT DF_WishlistItems_Id DEFAULT NEWID() NOT NULL,
        PlaceId UNIQUEIDENTIFIER NOT NULL,
        Priority NVARCHAR(20) CONSTRAINT DF_WishlistItems_Priority DEFAULT N'Medium' NOT NULL,
        Notes NVARCHAR(MAX) NULL,
        PlannedVisitDate DATE NULL,
        Status NVARCHAR(20) CONSTRAINT DF_WishlistItems_Status DEFAULT N'Pending' NOT NULL,
        CreatedAt DATETIME2(3) CONSTRAINT DF_WishlistItems_CreatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        UpdatedAt DATETIME2(3) CONSTRAINT DF_WishlistItems_UpdatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        CONSTRAINT PK_WishlistItems PRIMARY KEY CLUSTERED (WishlistItemId ASC),
        CONSTRAINT FK_WishlistItems_Places FOREIGN KEY (PlaceId) 
            REFERENCES dbo.Places (PlaceId) ON DELETE CASCADE,
        CONSTRAINT CK_WishlistItems_Priority CHECK (Priority IN (N'High', N'Medium', N'Low')),
        CONSTRAINT CK_WishlistItems_Status CHECK (Status IN (N'Pending', N'Visited', N'Archived'))
    );

    -- Unique filtered index preventing duplicate active pending items for the same place
    CREATE UNIQUE NONCLUSTERED INDEX UQ_Wishlist_Active_Place 
        ON dbo.WishlistItems (PlaceId) 
        WHERE Status = N'Pending';

    CREATE NONCLUSTERED INDEX IX_Wishlist_Priority ON dbo.WishlistItems (Priority);
    CREATE NONCLUSTERED INDEX IX_Wishlist_Status ON dbo.WishlistItems (Status);
    PRINT 'Table WishlistItems created successfully.';
END
ELSE
BEGIN
    -- If table was created earlier without index, ensure index is created
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Wishlist_Active_Place' AND object_id = OBJECT_ID(N'dbo.WishlistItems'))
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UQ_Wishlist_Active_Place 
            ON dbo.WishlistItems (PlaceId) 
            WHERE Status = N'Pending';
        PRINT 'Index UQ_Wishlist_Active_Place created successfully.';
    END
    PRINT 'Table WishlistItems already exists.';
END
GO

-- 4. Create Visits Table
IF OBJECT_ID(N'dbo.Visits', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Visits (
        VisitId UNIQUEIDENTIFIER CONSTRAINT DF_Visits_VisitId DEFAULT NEWID() NOT NULL,
        PlaceId UNIQUEIDENTIFIER NOT NULL,
        VisitDate DATE NOT NULL,
        Rating INT NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2(3) CONSTRAINT DF_Visits_CreatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        UpdatedAt DATETIME2(3) CONSTRAINT DF_Visits_UpdatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        CONSTRAINT PK_Visits PRIMARY KEY CLUSTERED (VisitId ASC),
        CONSTRAINT FK_Visits_Places FOREIGN KEY (PlaceId) 
            REFERENCES dbo.Places (PlaceId) ON DELETE CASCADE,
        CONSTRAINT CK_Visits_Rating CHECK (Rating IS NULL OR (Rating >= 1 AND Rating <= 5))
    );

    CREATE NONCLUSTERED INDEX IX_Visits_VisitDate ON dbo.Visits (VisitDate DESC);
    CREATE NONCLUSTERED INDEX IX_Visits_PlaceId ON dbo.Visits (PlaceId);
    PRINT 'Table Visits created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Visits already exists.';
END
GO

-- 5. Create Photos Table
IF OBJECT_ID(N'dbo.Photos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Photos (
        PhotoId UNIQUEIDENTIFIER CONSTRAINT DF_Photos_PhotoId DEFAULT NEWID() NOT NULL,
        PlaceId UNIQUEIDENTIFIER NOT NULL,
        VisitId UNIQUEIDENTIFIER NULL,
        FileName NVARCHAR(255) NOT NULL,
        StorageKey NVARCHAR(500) NOT NULL,
        Caption NVARCHAR(500) NULL,
        PhotoDate DATE NULL,
        Tags NVARCHAR(500) NULL,
        FileSize BIGINT CONSTRAINT DF_Photos_FileSize DEFAULT 0 NOT NULL,
        MimeType NVARCHAR(50) CONSTRAINT DF_Photos_MimeType DEFAULT N'image/jpeg' NOT NULL,
        CreatedAt DATETIME2(3) CONSTRAINT DF_Photos_CreatedAt DEFAULT SYSUTCDATETIME() NOT NULL,
        CONSTRAINT PK_Photos PRIMARY KEY CLUSTERED (PhotoId ASC),
        CONSTRAINT FK_Photos_Places FOREIGN KEY (PlaceId) 
            REFERENCES dbo.Places (PlaceId) ON DELETE CASCADE,
        -- Use ON DELETE NO ACTION to prevent SQL Server Msg 1785 multiple cascade paths error
        CONSTRAINT FK_Photos_Visits FOREIGN KEY (VisitId) 
            REFERENCES dbo.Visits (VisitId) ON DELETE NO ACTION
    );

    CREATE NONCLUSTERED INDEX IX_Photos_PlaceId ON dbo.Photos (PlaceId);
    CREATE NONCLUSTERED INDEX IX_Photos_VisitId ON dbo.Photos (VisitId);
    CREATE NONCLUSTERED INDEX IX_Photos_CreatedAt ON dbo.Photos (CreatedAt DESC);
    PRINT 'Table Photos created successfully.';
END
ELSE
BEGIN
    PRINT 'Table Photos already exists.';
END
GO
