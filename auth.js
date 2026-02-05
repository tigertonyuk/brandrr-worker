export function requireWorkerAuth(req, res, next) {
  const expected = process.env.WORKER_API_KEY;
  if (!expected) return res.status(500).json({ ok: false, message: "WORKER_API_KEY not set" });

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== expected) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  next();
}
