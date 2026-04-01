import { describe, it, expect, beforeEach, vi } from "vitest";
import apiRequest from "./index";
describe("apiRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("returns success with data on 2xx", async () => {
    const data = { ok: true };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: async () => data,
    } as unknown as Response);
    const res = await apiRequest("/event", "POST", { name: "x" });
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
  });
  it("returns message from response body on error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
      json: async () => ({ message: "invalid" }),
    } as unknown as Response);
    const res = await apiRequest("/event", "POST", { name: "x" });
    expect(res.success).toBe(false);
    expect(res.message).toBe("invalid");
  });
  it("extracts first error from errors array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
      json: async () => ({ errors: [{ message: "first error" }, { message: "second" }] }),
    } as unknown as Response);
    const res = await apiRequest("/event", "POST", { name: "x" });
    expect(res.success).toBe(false);
    expect(res.message).toBe("first error");
  });
  it("appends query params for GET with payload", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      statusText: "OK",
      json: async () => ({ ok: true }),
    } as unknown as Response);
    await apiRequest("/event", "GET", { page: 1, q: "x" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toMatch("/event?");
    expect(url).toMatch("page=1");
    expect(url).toMatch("q=x");
  });
  it("returns network error message on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("failed"));
    const res = await apiRequest("/event", "GET");
    expect(res.success).toBe(false);
    expect(res.message).toBe("failed");
  });
});
