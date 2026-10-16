-- ============================================================================
-- Travel-Doc Seed Data
-- ============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

USE TravelDocDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Insert Sample Places
DECLARE @PlaceKyoto UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @PlaceParis UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @PlaceReykjavik UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @PlaceBanff UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';
DECLARE @PlaceRome UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555';
DECLARE @PlaceCusco UNIQUEIDENTIFIER = '66666666-6666-6666-6666-666666666666';

IF NOT EXISTS (SELECT 1 FROM dbo.Places WHERE PlaceId = @PlaceKyoto)
BEGIN
    INSERT INTO dbo.Places (PlaceId, Name, Address, City, Country, Latitude, Longitude, Category, Description)
    VALUES
    (@PlaceKyoto, N'Fushimi Inari Taisha', N'68 Fukakusa Yabunouchicho', N'Kyoto', N'Japan', 34.9671402, 135.7726717, N'Historic', N'Iconic shrine known for thousands of vibrant vermilion torii gates winding up sacred Mount Inari.'),
    (@PlaceParis, N'Eiffel Tower', N'Champ de Mars, 5 Av. Anatole France', N'Paris', N'France', 48.8583701, 2.2944813, N'Culture', N'Wrought-iron lattice tower on the Champ de Mars, a global cultural icon of France.'),
    (@PlaceReykjavik, N'Blue Lagoon', N'Nordurljosavegur 9, 240 Grindavik', N'Reykjavik', N'Iceland', 63.8804000, -22.4495000, N'Nature', N'Geothermal spa located in a lava field, renowned for its mineral-rich milky-blue waters.'),
    (@PlaceBanff, N'Lake Louise', N'Banff National Park', N'Banff', N'Canada', 51.4253710, -116.1772550, N'Adventure', N'Turquoise glacier-fed lake surrounded by high peaks and the Victoria Glacier.'),
    (@PlaceRome, N'Colosseum', N'Piazza del Colosseo, 1', N'Rome', N'Italy', 41.8902102, 12.4922309, N'Historic', N'Ancient oval amphitheatre in the centre of Rome, the largest ever built.'),
    (@PlaceCusco, N'Machu Picchu', N'Urubamba Province', N'Cusco Region', N'Peru', -13.1631412, -72.5449629, N'Adventure', N'15th-century Inca citadel situated on a mountain ridge above the Sacred Valley.');
    PRINT 'Inserted sample places.';
END
ELSE
BEGIN
    PRINT 'Sample places already present.';
END
GO

-- 2. Insert Wishlist Items
DECLARE @PlaceReykjavik UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @PlaceBanff UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';
DECLARE @PlaceCusco UNIQUEIDENTIFIER = '66666666-6666-6666-6666-666666666666';

IF NOT EXISTS (SELECT 1 FROM dbo.WishlistItems WHERE PlaceId = @PlaceReykjavik)
BEGIN
    INSERT INTO dbo.WishlistItems (WishlistItemId, PlaceId, Priority, Notes, PlannedVisitDate, Status)
    VALUES
    (NEWID(), @PlaceReykjavik, N'High', N'Plan during winter to combine with Northern Lights tour.', '2027-02-15', N'Pending'),
    (NEWID(), @PlaceBanff, N'Medium', N'Hike the Plain of Six Glaciers trail and rent a canoe.', '2027-07-20', N'Pending'),
    (NEWID(), @PlaceCusco, N'High', N'Book Inca Trail permits 6 months in advance.', '2027-09-10', N'Pending');
    PRINT 'Inserted sample wishlist items.';
END
ELSE
BEGIN
    PRINT 'Sample wishlist items already present.';
END
GO

-- 3. Insert Visits
DECLARE @PlaceKyoto UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @PlaceParis UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @PlaceRome UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555';
DECLARE @VisitKyoto UNIQUEIDENTIFIER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
DECLARE @VisitParis UNIQUEIDENTIFIER = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

IF NOT EXISTS (SELECT 1 FROM dbo.Visits WHERE VisitId = @VisitKyoto)
BEGIN
    INSERT INTO dbo.Visits (VisitId, PlaceId, VisitDate, Rating, Notes)
    VALUES
    (@VisitKyoto, @PlaceKyoto, '2025-11-12', 5, N'Hiked the entire mountain early at 6 AM before the crowds arrived. Unbelievable atmosphere amidst the cedar forest.'),
    (@VisitParis, @PlaceParis, '2026-05-18', 4, N'Watched the hourly light sparkle from Pont de Bir-Hakeim. Picnic with fresh baguettes on the lawn.'),
    (NEWID(), @PlaceRome, '2026-06-04', 5, N'Underground gladiator tunnel tour was deeply moving. Highly recommended guided audio tour.');
    PRINT 'Inserted sample visits.';
END
ELSE
BEGIN
    PRINT 'Sample visits already present.';
END
GO
