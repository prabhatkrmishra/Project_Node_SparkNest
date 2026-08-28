export const ok = (res, data, meta) => res.json({ success: true, data, ...(meta && { meta }) });

export const created = (res, data) => res.status(201).json({ success: true, data });

export const paginated = (res, articles, totalPages, totalCount) =>
  res.json({ success: true, data: articles, meta: { totalPages, totalCount } });
