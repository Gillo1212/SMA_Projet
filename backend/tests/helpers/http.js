/**
 * Faux objets Express pour appeler un contrôleur directement.
 *
 *   const res = mockRes();
 *   await controller.create(mockReq({ body }), res, next);
 *   expect(res.statusCode).toBe(201);
 *   expect(res.body.success).toBe(true);
 */

function mockReq({ body = {}, params = {}, query = {}, user, headers = {}, rawBody } = {}) {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    body,
    params,
    query,
    user,
    headers: lower,
    rawBody,
    get: name => lower[name.toLowerCase()],
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { res.statusCode = code; return res; },
    json(payload) { res.body = payload; return res; },
  };
  return res;
}

/** `next(error)` : garde l'erreur pour l'assertion */
function mockNext() {
  const next = jest.fn();
  return next;
}

module.exports = { mockReq, mockRes, mockNext };
