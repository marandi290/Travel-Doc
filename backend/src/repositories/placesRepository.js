import { query } from '../config/database.js';

export const placesRepository = {
  async findAll({ category = null, search = null, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT PlaceId, Name, Address, City, Country, Latitude, Longitude, Description, Category, CreatedAt, UpdatedAt
      FROM dbo.Places
      WHERE 1=1
    `;
    const params = {};

    if (category && category !== 'All') {
      sql += ` AND Category = @category`;
      params.category = category;
    }

    if (search) {
      sql += ` AND (Name LIKE @search OR City LIKE @search OR Country LIKE @search)`;
      params.search = `%${search}%`;
    }

    sql += ` ORDER BY CreatedAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;`;
    params.offset = offset;
    params.limit = limit;

    const res = await query(sql, params);
    return res.recordset;
  },

  async findById(placeId) {
    const sql = `
      SELECT PlaceId, Name, Address, City, Country, Latitude, Longitude, Description, Category, CreatedAt, UpdatedAt
      FROM dbo.Places
      WHERE PlaceId = @placeId;
    `;
    const res = await query(sql, { placeId });
    return res.recordset[0] || null;
  },

  async findByCoordinatesOrName(name, latitude, longitude) {
    // Check if place exists near exact coordinates (~50 meters) or exact name+city
    const sql = `
      SELECT TOP 1 PlaceId, Name, Address, City, Country, Latitude, Longitude, Description, Category
      FROM dbo.Places
      WHERE (ABS(Latitude - @latitude) < 0.0005 AND ABS(Longitude - @longitude) < 0.0005)
         OR (Name = @name);
    `;
    const res = await query(sql, { name, latitude, longitude });
    return res.recordset[0] || null;
  },

  async create({ name, address, city, country, latitude, longitude, description, category }) {
    const sql = `
      INSERT INTO dbo.Places (Name, Address, City, Country, Latitude, Longitude, Description, Category)
      OUTPUT INSERTED.PlaceId, INSERTED.Name, INSERTED.Address, INSERTED.City, INSERTED.Country, 
             INSERTED.Latitude, INSERTED.Longitude, INSERTED.Description, INSERTED.Category, INSERTED.CreatedAt
      VALUES (@name, @address, @city, @country, @latitude, @longitude, @description, @category);
    `;
    const res = await query(sql, {
      name,
      address: address || null,
      city: city || null,
      country,
      latitude,
      longitude,
      description: description || null,
      category: category || 'Culture',
    });
    return res.recordset[0];
  },

  async update(placeId, { name, address, city, country, latitude, longitude, description, category }) {
    const sql = `
      UPDATE dbo.Places
      SET Name = COALESCE(@name, Name),
          Address = COALESCE(@address, Address),
          City = COALESCE(@city, City),
          Country = COALESCE(@country, Country),
          Latitude = COALESCE(@latitude, Latitude),
          Longitude = COALESCE(@longitude, Longitude),
          Description = COALESCE(@description, Description),
          Category = COALESCE(@category, Category),
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.PlaceId, INSERTED.Name, INSERTED.Address, INSERTED.City, INSERTED.Country,
             INSERTED.Latitude, INSERTED.Longitude, INSERTED.Description, INSERTED.Category, INSERTED.UpdatedAt
      WHERE PlaceId = @placeId;
    `;
    const res = await query(sql, {
      placeId,
      name: name || null,
      address: address || null,
      city: city || null,
      country: country || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      description: description || null,
      category: category || null,
    });
    return res.recordset[0] || null;
  },

  async delete(placeId) {
    const sql = `DELETE FROM dbo.Places WHERE PlaceId = @placeId;`;
    const res = await query(sql, { placeId });
    return res.rowsAffected[0] > 0;
  },
};
