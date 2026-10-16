import { query } from '../config/database.js';

export const wishlistRepository = {
  async findAll({ status = 'Pending', priority = null, category = null } = {}) {
    let sql = `
      SELECT 
        w.WishlistItemId,
        w.PlaceId,
        w.Priority,
        w.Notes,
        w.PlannedVisitDate,
        w.Status,
        w.CreatedAt AS WishlistCreatedAt,
        p.Name,
        p.Address,
        p.City,
        p.Country,
        p.Latitude,
        p.Longitude,
        p.Category,
        p.Description
      FROM dbo.WishlistItems w
      JOIN dbo.Places p ON w.PlaceId = p.PlaceId
      WHERE 1=1
    `;
    const params = {};

    if (status && status !== 'All') {
      sql += ` AND w.Status = @status`;
      params.status = status;
    }

    if (priority && priority !== 'All') {
      sql += ` AND w.Priority = @priority`;
      params.priority = priority;
    }

    if (category && category !== 'All') {
      sql += ` AND p.Category = @category`;
      params.category = category;
    }

    sql += ` ORDER BY w.CreatedAt DESC;`;

    const res = await query(sql, params);
    return res.recordset;
  },

  async findById(wishlistItemId) {
    const sql = `
      SELECT 
        w.WishlistItemId,
        w.PlaceId,
        w.Priority,
        w.Notes,
        w.PlannedVisitDate,
        w.Status,
        w.CreatedAt AS WishlistCreatedAt,
        p.Name,
        p.Address,
        p.City,
        p.Country,
        p.Latitude,
        p.Longitude,
        p.Category,
        p.Description
      FROM dbo.WishlistItems w
      JOIN dbo.Places p ON w.PlaceId = p.PlaceId
      WHERE w.WishlistItemId = @wishlistItemId;
    `;
    const res = await query(sql, { wishlistItemId });
    return res.recordset[0] || null;
  },

  async findActiveByPlaceId(placeId) {
    const sql = `
      SELECT WishlistItemId, PlaceId, Priority, Status
      FROM dbo.WishlistItems
      WHERE PlaceId = @placeId AND Status = 'Pending';
    `;
    const res = await query(sql, { placeId });
    return res.recordset[0] || null;
  },

  async create({ placeId, priority = 'Medium', notes = null, plannedVisitDate = null, status = 'Pending' }) {
    const sql = `
      INSERT INTO dbo.WishlistItems (PlaceId, Priority, Notes, PlannedVisitDate, Status)
      OUTPUT INSERTED.WishlistItemId, INSERTED.PlaceId, INSERTED.Priority, INSERTED.Notes, 
             INSERTED.PlannedVisitDate, INSERTED.Status, INSERTED.CreatedAt
      VALUES (@placeId, @priority, @notes, @plannedVisitDate, @status);
    `;
    const res = await query(sql, {
      placeId,
      priority,
      notes: notes || null,
      plannedVisitDate: plannedVisitDate || null,
      status,
    });
    return res.recordset[0];
  },

  async update(wishlistItemId, { priority, notes, plannedVisitDate, status }) {
    const sql = `
      UPDATE dbo.WishlistItems
      SET Priority = COALESCE(@priority, Priority),
          Notes = COALESCE(@notes, Notes),
          PlannedVisitDate = COALESCE(@plannedVisitDate, PlannedVisitDate),
          Status = COALESCE(@status, Status),
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.WishlistItemId, INSERTED.PlaceId, INSERTED.Priority, INSERTED.Notes, 
             INSERTED.PlannedVisitDate, INSERTED.Status, INSERTED.UpdatedAt
      WHERE WishlistItemId = @wishlistItemId;
    `;
    const res = await query(sql, {
      wishlistItemId,
      priority: priority || null,
      notes: notes ?? null,
      plannedVisitDate: plannedVisitDate ?? null,
      status: status || null,
    });
    return res.recordset[0] || null;
  },

  async markVisitedByPlaceId(placeId) {
    const sql = `
      UPDATE dbo.WishlistItems
      SET Status = 'Visited',
          UpdatedAt = SYSUTCDATETIME()
      WHERE PlaceId = @placeId AND Status = 'Pending';
    `;
    const res = await query(sql, { placeId });
    return res.rowsAffected[0];
  },

  async delete(wishlistItemId) {
    const sql = `DELETE FROM dbo.WishlistItems WHERE WishlistItemId = @wishlistItemId;`;
    const res = await query(sql, { wishlistItemId });
    return res.rowsAffected[0] > 0;
  },
};
