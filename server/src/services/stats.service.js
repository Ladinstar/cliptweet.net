import { getCollections } from '../db.js';

function toMap(rows) {
  return rows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});
}

/** Non-sensitive counter for the public "social proof" badge. */
export async function getPublicStats() {
  const { downloads } = getCollections();
  return { downloads: await downloads.estimatedDocumentCount() };
}

export async function getStats() {
  const { downloads, errors } = getCollections();

  const [downloadsCount, errorsCount, lastLinks, lastErrors, formatStats, qualityStats] = await Promise.all([
    downloads.countDocuments(),
    errors.countDocuments(),
    downloads
      .find({}, { projection: { _id: 0, url: 1, title: 1, format: 1, quality: 1, timestamp: 1 } })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray(),
    errors
      .find({}, { projection: { _id: 0, url: 1, message: 1, timestamp: 1 } })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray(),
    downloads.aggregate([{ $group: { _id: { $ifNull: ['$format', 'unknown'] }, count: { $sum: 1 } } }]).toArray(),
    downloads.aggregate([{ $group: { _id: { $ifNull: ['$quality', 'unknown'] }, count: { $sum: 1 } } }]).toArray(),
  ]);

  return {
    downloads: downloadsCount,
    errors: errorsCount,
    lastLinks,
    lastErrors,
    formatStats: toMap(formatStats),
    qualityStats: toMap(qualityStats),
  };
}
