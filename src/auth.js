export function requireWorkerAuth(req, res, next) {
  const expected = process.env.WORKER_API_KEY;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!expected || token !== expected) return res.status(401).json({ ok:false });
  next();
}