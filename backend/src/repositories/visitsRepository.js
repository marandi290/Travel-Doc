import { query } from '../config/database.js';

export const visitsRepository = {
  async findAll({ placeId = null, country = null, startDate = null, endDate = null } = {}) {
    let sql = `
      SELECT 
        v.VisitId,
        v.PlaceId,
        v.VisitDate,
        v.Rating,
        v.Notes,
        v.CreatedAt,
        p.Name AS PlaceName,
        p.City,
        p.Country,
        p.Latitude,
        p.Longitude,
        p.Category
      FROM dbo.Visits v
      JOIN dbo.Places p ON v.PlaceId = p.PlaceId
      WHERE 1=1
    `;
    const params = {};

    if (placeId) {
      sql += ` AND v.PlaceId = @placeId`;
      params.placeId = placeId;
    }

    if (country && country !== 'All') {
      sql += ` AND p.Country = @country`;
      params.country = country;
    }

    if (startDate) {
      sql += ` AND v.VisitDate >= @startDate`;
      params.startDate = startDate;
    }

    if (endDate) {
      sql += ` AND v.VisitDate <= @endDate`;
      params.endDate = endDate;
    }

    sql += ` ORDER BY v.VisitDate DESC;`;

    const res = await query(sql, params);
    return res.recordset;
  },

  async findById(visitId) {
    const sql = `
      SELECT 
        v.VisitId,
        v.PlaceId,
        v.VisitDate,
        v.Rating,
        v.Notes,
        v.CreatedAt,
        p.Name AS PlaceName,
        p.City,
        p.Country,
        p.Latitude,
        p.Longitude,
        p.Category
      FROM dbo.Visits v
      JOIN dbo.Places p ON v.PlaceId = p.PlaceId
      WHERE v.VisitId = @visitId;
    `;
    const res = await query(sql, { visitId });
    return res.recordset[0] || null;
  },

  async create({ placeId, visitDate, rating = null, notes = null }) {
    const sql = `
      INSERT INTO dbo.Visits (PlaceId, VisitDate, Rating, Notes)
      OUTPUT INSERTED.VisitId, INSERTED.PlaceId, INSERTED.VisitDate, INSERTED.Rating, 
             INSERTED.Notes, INSERTED.CreatedAt
      VALUES (@placeId, @visitDate, @rating, @notes);
    `;
    const res = await query(sql, {
      placeId,
      visitDate,
      rating: rating ?? null,
      notes: notes || null,
    });
    return res.recordset[0];
  },

  async update(visitId, { visitDate, rating, notes }) {
    const sql = `
      UPDATE dbo.Visits
      SET VisitDate = COALESCE(@visitDate, VisitDate),
          Rating = COALESCE(@rating, Rating),
          Notes = COALESCE(@notes, Notes),
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.VisitId, INSERTED.PlaceId, INSERTED.VisitDate, INSERTED.Rating, 
             INSERTED.Notes, INSERTED.UpdatedAt
      WHERE VisitId = @visitId;
    `;
    const res = await query(sql, {
      visitId,
      visitDate: visitDate || null,
      rating: rating ?? null,
      notes: notes ?? null,
    });
    return res.recordset[0] || null;
  },

  async delete(visitId) {
    const sql = `DELETE FROM dbo.Visits WHERE VisitId = @visitId;`;
    const res = await query(sql, { visitId });
    return res.rowsAffected[0] > 0;
  },

  async countUniqueCountries() {
    const sql = `
      SELECT COUNT(DISTINCT p.Country) AS CountriesCount
      FROM dbo.Visits v
      JOIN dbo.Places p ON v.PlaceId = p.PlaceId;
    `;
    const res = await query(sql);
    return res.recordset[0]?.CountriesCount || 0;
  },
};
