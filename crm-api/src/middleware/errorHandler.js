export function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Référence déjà utilisée (contrainte unique).' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Enregistrement introuvable.' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erreur serveur interne.' });
}
