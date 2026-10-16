import { query } from '../config/database.js';

export const photosRepository = {
  async findAll({ placeId = null, visitId = null, tag = null } = {}) {
    let sql = `
      SELECT 
        ph.PhotoId,
        ph.PlaceId,
        ph.VisitId,
        ph.FileName,
        ph.StorageKey,
        ph.Caption,
        ph.PhotoDate,
        ph.Tags,
        ph.FileSize,
        ph.MimeType,
        ph.CreatedAt,
        p.Name AS PlaceName,
        p.Country
      FROM dbo.Photos ph
      JOIN dbo.Places p ON ph.PlaceId = p.PlaceId
      WHERE 1=1
    `;
    const params = {};

    if (placeId) {
      sql += ` AND ph.PlaceId = @placeId`;
      params.placeId = placeId;
    }

    if (visitId) {
      sql += ` AND ph.VisitId = @visitId`;
      params.visitId = visitId;
    }

    if (tag && tag !== 'All') {
      sql += ` AND ph.Tags LIKE @tag`;
      params.tag = `%${tag}%`;
    }

    sql += ` ORDER BY ph.CreatedAt DESC;`;

    const res = await query(sql, params);
    return res.recordset;
  },

  async findById(photoId) {
    const sql = `
      SELECT 
        ph.PhotoId,
        ph.PlaceId,
        ph.VisitId,
        ph.FileName,
        ph.StorageKey,
        ph.Caption,
        ph.PhotoDate,
        ph.Tags,
        ph.FileSize,
        ph.MimeType,
        ph.CreatedAt,
        p.Name AS PlaceName,
        p.Country
      FROM dbo.Photos ph
      JOIN dbo.Places p ON ph.PlaceId = p.PlaceId
      WHERE ph.PhotoId = @photoId;
    `;
    const res = await query(sql, { photoId });
    return res.recordset[0] || null;
  },

  async create({ placeId, visitId = null, fileName, storageKey, caption = null, photoDate = null, tags = null, fileSize, mimeType }) {
    const sql = `
      INSERT INTO dbo.Photos (PlaceId, VisitId, FileName, StorageKey, Caption, PhotoDate, Tags, FileSize, MimeType)
      OUTPUT INSERTED.PhotoId, INSERTED.PlaceId, INSERTED.VisitId, INSERTED.FileName, 
             INSERTED.StorageKey, INSERTED.Caption, INSERTED.PhotoDate, INSERTED.Tags, 
             INSERTED.FileSize, INSERTED.MimeType, INSERTED.CreatedAt
      VALUES (@placeId, @visitId, @fileName, @storageKey, @caption, @photoDate, @tags, @fileSize, @mimeType);
    `;
    const res = await query(sql, {
      placeId,
      visitId: visitId || null,
      fileName,
      storageKey,
      caption: caption || null,
      photoDate: photoDate || null,
      tags: tags || null,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'image/jpeg',
    });
    return res.recordset[0];
  },

  async update(photoId, { caption, tags }) {
    const sql = `
      UPDATE dbo.Photos
      SET Caption = COALESCE(@caption, Caption),
          Tags = COALESCE(@tags, Tags)
      OUTPUT INSERTED.PhotoId, INSERTED.PlaceId, INSERTED.VisitId, INSERTED.FileName,
             INSERTED.StorageKey, INSERTED.Caption, INSERTED.PhotoDate, INSERTED.Tags
      WHERE PhotoId = @photoId;
    `;
    const res = await query(sql, {
      photoId,
      caption: caption ?? null,
      tags: tags ?? null,
    });
    return res.recordset[0] || null;
  },

  async delete(photoId) {
    const sql = `
      DELETE FROM dbo.Photos
      OUTPUT DELETED.PhotoId, DELETED.StorageKey
      WHERE PhotoId = @photoId;
    `;
    const res = await query(sql, { photoId });
    return res.recordset[0] || null;
  },
};
