// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const { csrfMiddleware } = await import("../middleware/auth");

function mockReq(overrides: Record<string, unknown> = {}) {
  return {
    method: "POST",
    path: "/",
    originalUrl: "/api/v1/scans",
    headers: {},
    ...overrides,
  } as any;
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("CSRF middleware", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.FRONTEND_URL = "http://localhost:3000";
  });

  it("skips GET requests", () => {
    const req = mockReq({ method: "GET" });
    const res = mockRes();
    const next = vi.fn();
    csrfMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("skips Bearer token requests", () => {
    const req = mockReq({
      headers: { authorization: "Bearer gr_test_key" },
    });
    const res = mockRes();
    const next = vi.fn();
    csrfMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("rejects POST without origin", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    csrfMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects POST with origin but missing CSRF token", () => {
    const req = mockReq({
      headers: {
        origin: "http://localhost:3000",
        cookie: "csrf_token=abc123",
      },
    });
    const res = mockRes();
    const next = vi.fn();
    csrfMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("token mismatch") })
    );
  });

  it("allows POST with matching origin and CSRF double-submit", () => {
    const req = mockReq({
      headers: {
        origin: "http://localhost:3000",
        cookie: "csrf_token=abc123",
        "x-csrf-token": "abc123",
      },
    });
    const res = mockRes();
    const next = vi.fn();
    csrfMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
