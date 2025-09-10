import React, { useEffect, useMemo, useState } from "react";
import "./InitialImportView.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

type Mode = "initial" | "multi";

type Area = { _id: string; name: string };
type Product = {
  _id?: string;
  id: number; // numeric code to send as productCode
  name?: string;
  type?: string;
  priceInDollars?: number;
};
type Day = { _id: string; name?: string; title?: string };

type FileRow = {
  file: File;
  areaId: string; // per-file
  startAt?: number; // initial-only
  dayId?: string; // multi-only
  date?: string; // multi-only (YYYY-MM-DD)
  previewCount?: number | null;
  validationError?: string | null;
};

const INITIAL_ENDPOINT =
  "http://localhost:5000/api/adminUpload/upload-initials";
const MULTI_ENDPOINT =
  "http://localhost:5000/api/adminUpload/upload-multi-shipments";
const AREAS_ENDPOINT = "http://localhost:5000/api/areas/company";
const DAYS_ENDPOINT = "http://localhost:5000/api/days";

export default function InitialImportView({
  endpoint = INITIAL_ENDPOINT,
  areasEndpoint,
  productsEndpoint,
  presetDate,
  presetCurrency = "USD",
}: {
  endpoint?: string;
  areasEndpoint?: string;
  productsEndpoint?: string;
  presetDate?: string;
  presetCurrency?: "USD" | "LBP";
}) {
  const token = useSelector((s: RootState) => s.user.token);
  const companyId = useSelector((s: RootState) => s.user.companyId);
  // ====== MODE TOGGLE ======
  const [mode, setMode] = useState<Mode>("initial");

  // ====== Global fields ======
  const [date, setDate] = useState<string>(
    presetDate || new Date().toISOString().slice(0, 10)
  );
  const [currency, setCurrency] = useState<"USD" | "LBP">(presetCurrency);
  const defaultReturn = 2;

  // Exchange rate (used in multi mode, fetched once)
  const [exchange, setExchange] = useState<{
    companyId?: string;
    exchangeRateInLBP?: number;
  } | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  // ====== Lists ======
  const resolvedAreasEndpoint = areasEndpoint || AREAS_ENDPOINT; // server infers company from auth

  const resolvedProductsEndpoint =
    productsEndpoint ||
    (companyId
      ? `http://localhost:5000/api/products/company/${companyId}`
      : "http://localhost:5000/api/products/company");

  const [areas, setAreas] = useState<Area[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areasError, setAreasError] = useState<string | null>(null);

  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(false);
  const [daysError, setDaysError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productCode, setProductCode] = useState<number | "">("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // ====== Files ======
  const [files, setFiles] = useState<FileRow[]>([]);

  // ====== Server result ======
  const [submitting, setSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // ---------- helpers ----------
  async function fetchJsonSafe(url: string, init?: RequestInit) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init?.headers || {}),
      },
      ...init,
    });
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("application/json")) {
      const text = await res.text();
      const preview = text.slice(0, 200).replace(/\s+/g, " ").trim();
      throw new Error(
        `Non-JSON response (${res.status}). First bytes: ${preview}`
      );
    }
    const json = await res.json();
    if (!res.ok) {
      throw new Error(
        (json && (json.error || json.message)) || `HTTP ${res.status}`
      );
    }
    return json;
  }

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const json = await fetchJsonSafe(
        "http://localhost:5000/api/exchange-rate"
      );
      if (typeof json?.exchangeRateInLBP !== "number") {
        throw new Error("exchangeRateInLBP missing");
      }
      setExchange(json);
    } catch (e: any) {
      setServerError(e?.message || "Failed to load exchange rate");
    } finally {
      setLoadingRate(false);
    }
  };

  // ---------- load lists ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setAreasLoading(true);
        setAreasError(null);
        const data = await fetchJsonSafe(resolvedAreasEndpoint);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.areas)
          ? data.areas
          : [];
        const norm = arr
          .map((a: any) => ({
            _id: a._id || a.id || "",
            name: a.name || a.title || "(no name)",
          }))
          .filter((a: any) => a._id);
        norm.sort((a: any, b: any) => a.name.localeCompare(b.name, "ar"));
        if (alive) setAreas(norm);
      } catch (e: any) {
        if (alive) setAreasError(e?.message || "Failed to load areas");
      } finally {
        if (alive) setAreasLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [resolvedAreasEndpoint]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setDaysLoading(true);
        setDaysError(null);
        const d = await fetchJsonSafe(DAYS_ENDPOINT);
        const arr = Array.isArray(d) ? d : Array.isArray(d?.days) ? d.days : [];
        const norm = arr
          .map((x: any) => ({
            _id: x._id || x.id,
            name: x.name || x.title || "",
          }))
          .filter((x: any) => x._id);
        if (alive) setDays(norm);
      } catch (e: any) {
        if (alive) setDaysError(e?.message || "Failed to load days");
      } finally {
        if (alive) setDaysLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (
      !resolvedProductsEndpoint ||
      /undefined\b/.test(resolvedProductsEndpoint)
    )
      return;
    (async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const data = await fetchJsonSafe(resolvedProductsEndpoint);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];
        const norm = arr
          .filter((p: any) => typeof p.id === "number")
          .map((p: any) => ({
            id: p.id,
            _id: p._id,
            name: p.name,
            type: p.type,
            priceInDollars: p.priceInDollars,
          }));
        if (alive) {
          setProducts(norm);
          if (norm.length && productCode === "") setProductCode(norm[0].id);
        }
      } catch (e: any) {
        if (alive) setProductsError(e?.message || "Failed to load products");
      } finally {
        if (alive) setProductsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [resolvedProductsEndpoint, productCode]);

  // Fetch exchange rate on mount (harmless in initial mode; required in multi)
  useEffect(() => {
    fetchExchangeRate(); /* no deps - once */
  }, []);

  // ---------- derived ----------
  const totalFiles = files.length;
  const uniqueNamesOk = useMemo(() => {
    const s = new Set(files.map((f) => f.file.name));
    return s.size === files.length;
  }, [files]);

  const readyToSubmit = useMemo(() => {
    if (!totalFiles) return false;
    if (productCode === "" || !Number.isFinite(Number(productCode)))
      return false;
    if (!uniqueNamesOk) return false;
    if (productsLoading || productsError) return false;

    if (mode === "initial") {
      if (!date) return false;
      for (const f of files) {
        if (!f.areaId || !f.file) return false;
        if (f.validationError) return false;
      }
      return true;
    } else {
      // multi shipments
      if (!exchange?.exchangeRateInLBP) return false; // for LBP→USD math on server
      for (const f of files) {
        if (!f.areaId || !f.dayId || !f.date) return false;
        if (f.validationError) return false;
      }
      return true;
    }
  }, [
    mode,
    totalFiles,
    files,
    productCode,
    uniqueNamesOk,
    productsLoading,
    productsError,
    date,
    exchange,
  ]);

  // ---------- file picking ----------
  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const input = e.currentTarget;
    const picked = input.files ? Array.from(input.files) : [];
    input.value = ""; // allow re-picking
    if (!picked.length) return;

    const fresh: FileRow[] = [];
    for (const f of picked) {
      const row: FileRow = {
        file: f,
        areaId: "",
        startAt: undefined,
        previewCount: null,
        validationError: null,
      };
      try {
        const text = await f.text();
        const parsed = JSON.parse(text);
        console.log(parsed);
        if (!Array.isArray(parsed) && !Array.isArray(parsed?.orders)) {
          row.validationError =
            "JSON must be an array (or have 'orders' array).";
        } else {
          // support both shapes: [ { ... } ] or { orders: [ ... ] }
          const count = Array.isArray(parsed)
            ? parsed.length
            : parsed.orders.length;
          row.previewCount = count;
        }
      } catch (err: any) {
        row.validationError = `Invalid JSON: ${err?.message || "parse error"}`;
      }
      // sensible defaults for multi mode: prefill date with global date
      row.date = new Date().toISOString().slice(0, 10);
      fresh.push(row);
    }
    setFiles((prev) => [...prev, ...fresh]);
  };

  const updateFileMeta = (idx: number, patch: Partial<FileRow>) => {
    setFiles((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };

  const removeAt = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => {
    setFiles([]);
    setServerResult(null);
    setServerError(null);
  };

  // ---------- submit ----------
  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setServerError(null);
      setServerResult(null);
      if (!files.length) throw new Error("No files selected");

      const fd = new FormData();

      // Use safe, ASCII file names that encode area/day to make mapping deterministic
      const mkSafeName = (idx: number, extra: string[]) =>
        `f_${String(idx).padStart(3, "0")}${
          extra.length ? `__${extra.join("__")}` : ""
        }.json`;

      // Per-file maps
      const areaMap: Record<string, string> = {};
      const startAtMap: Record<string, number> = {};
      const dayMap: Record<string, string> = {};
      const dateMap: Record<string, string> = {};
      const originalNames: string[] = [];

      files.forEach((row, idx) => {
        const extras: string[] = [];
        if (row.areaId) extras.push(`area_${row.areaId.slice(-6)}`);
        if (mode === "multi" && row.dayId)
          extras.push(`day_${row.dayId.slice(-6)}`);
        const safeName = mkSafeName(idx, extras);

        originalNames.push(row.file.name);
        const renamed = new File([row.file], safeName, {
          type: row.file.type || "application/json",
        });
        // Avoid re-wrapping; just override the filename in the third arg
        fd.append("files", row.file, safeName);

        areaMap[safeName] = row.areaId;
        if (typeof row.startAt === "number" && Number.isFinite(row.startAt))
          startAtMap[safeName] = row.startAt;
        if (mode === "multi") {
          if (row.dayId) dayMap[safeName] = row.dayId;
          if (row.date) dateMap[safeName] = row.date;
        }
      });

      // Common
      fd.append("productCode", String(productCode));
      fd.append("originalNames", JSON.stringify(originalNames));

      if (mode === "initial") {
        fd.append("date", date);
        fd.append("currency", currency);
        fd.append("defaultReturn", String(defaultReturn));
        fd.append("areaMap", JSON.stringify(areaMap));
        if (Object.keys(startAtMap).length)
          fd.append("startAtMap", JSON.stringify(startAtMap));
      } else {
        // multi-shipments
        // keep area map; add per-file day/date maps; include exchange rate for LBP math
        fd.append("areaMap", JSON.stringify(areaMap));
        fd.append("dayMap", JSON.stringify(dayMap)); // NEW: per-file dayId
        fd.append("dateMap", JSON.stringify(dateMap)); // NEW: per-file YYYY-MM-DD
        if (exchange?.exchangeRateInLBP)
          fd.append("exchangeRateLBP", String(exchange.exchangeRateInLBP));

        // send a dummy global date/day for legacy controllers if they read it
        // (safe defaults; server should prefer per-file maps if present)
        fd.append("date", files[0]?.date || "");
        fd.append("dayId", files[0]?.dayId || "");
      }

      const url = mode === "initial" ? endpoint : MULTI_ENDPOINT;

      // DEBUG: verify the "files" entries exist
      const fileEntries = fd.getAll("files");
      console.log("files[] count", fileEntries.length);
      fileEntries.forEach((f: any, i: number) =>
        console.log("files[i]", i, f?.name, f?.size, f?.type)
      );

      // also keep your existing logs:
      console.log("productCode", String(productCode));
      console.log("originalNames", originalNames);
      console.log("areaMap", JSON.stringify(areaMap));
      console.log("dayMap", JSON.stringify(dayMap));
      console.log("dateMap", JSON.stringify(dateMap));
      if (exchange?.exchangeRateInLBP)
        console.log("exchangeRateLBP", exchange.exchangeRateInLBP);
      console.log("date", files[0]?.date);
      console.log("dayId", files[0]?.dayId);

      const resp = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const ct = (resp.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("application/json")) {
        const text = await resp.text();
        throw new Error(`Upload error (${resp.status}): ${text.slice(0, 200)}`);
      }
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || `HTTP ${resp.status}`);
      }
      setServerResult(data);
    } catch (err: any) {
      setServerError(err?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- render ----------
  return (
    <div className="trx-initial-import max-w-6xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl shadow p-6 bg-white initial-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Shipments Import</h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${mode === "initial" ? "font-semibold" : ""}`}
            >
              Initial
            </span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={mode === "multi"}
                onChange={(e) =>
                  setMode(e.target.checked ? "multi" : "initial")
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative">
                <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
            <span
              className={`text-sm ${mode === "multi" ? "font-semibold" : ""}`}
            >
              Multi-shipments
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Upload one <span className="font-medium">JSON</span> file per
          shipment. In <span className="font-medium">Multi-shipments</span>{" "}
          mode, each file has its own <code>Day</code> and <code>Date</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Global date (used in Initial mode and as fallback) */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Default Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg px-3 py-2"
            />
            <span className="text-xs text-gray-500">
              Used in Initial mode; in Multi mode it pre-fills per-file dates
              (you can override).
            </span>
          </label>

          {/* Currency only for Initial mode */}
          {mode === "initial" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="rounded-lg px-3 py-2"
              >
                <option value="USD">USD</option>
                <option value="LBP">LBP</option>
              </select>
            </label>
          )}

          {/* Product (common) */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Product</span>
            <select
              value={productCode === "" ? "" : String(productCode)}
              onChange={(e) =>
                setProductCode(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="rounded-lg px-3 py-2"
              disabled={productsLoading || !!productsError}
            >
              <option value="">
                {productsLoading
                  ? "Loading products…"
                  : productsError
                  ? `Failed: ${productsError}`
                  : "Select product"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.type || `Code ${p.id}`}
                  {typeof p.priceInDollars === "number"
                    ? ` — $${p.priceInDollars}`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          {/* Exchange rate (shown for Multi mode) */}
          {mode === "multi" && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Company LBP Exchange Rate
              </span>
              <div className="inline-flex items-center gap-2 border rounded px-3 py-2">
                <span className="opacity-70">LBP</span>
                <span className="font-semibold">
                  {exchange?.exchangeRateInLBP
                    ? exchange.exchangeRateInLBP.toLocaleString()
                    : "—"}
                </span>
                <button
                  type="button"
                  onClick={fetchExchangeRate}
                  disabled={loadingRate}
                  className={`ml-3 px-2 py-1 rounded text-white ${
                    loadingRate ? "bg-gray-400" : "bg-slate-700"
                  }`}
                >
                  {loadingRate ? "Refreshing…" : "Refresh"}
                </button>
              </div>
              {exchange?.companyId && (
                <div className="text-xs opacity-70 mt-1">
                  companyId: {exchange.companyId}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">
            JSON Files (multiple)
          </label>
          <input
            type="file"
            accept=".json,application/json"
            multiple
            onChange={onPickFiles}
            className="block"
          />
          {areasLoading && (
            <div className="text-sm text-gray-600 mt-2">Loading areas…</div>
          )}
          {areasError && (
            <div className="text-sm text-red-700 mt-2">{areasError}</div>
          )}
          {daysLoading && mode === "multi" && (
            <div className="text-sm text-gray-600 mt-2">Loading days…</div>
          )}
          {daysError && mode === "multi" && (
            <div className="text-sm text-red-700 mt-2">{daysError}</div>
          )}
        </div>

        {totalFiles > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Files ({totalFiles})</h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {files.map((row, idx) => (
                <div key={idx} className="rounded-xl p-4 files-card">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grow">
                      <div className="filename">{row.file.name}</div>
                      <div className="meta text-xs">
                        {row.previewCount ?? "?"} rows
                      </div>
                      {row.validationError && (
                        <div className="badge red mt-1">
                          {row.validationError}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeAt(idx)}
                      className="btn btn-outline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Area (both modes) */}
                    <label className="flex flex-col gap-1">
                      <span className="text-sm">Area</span>
                      <select
                        value={row.areaId}
                        onChange={(e) =>
                          updateFileMeta(idx, { areaId: e.target.value })
                        }
                        className="rounded-lg px-3 py-2"
                        disabled={areasLoading || !!areasError}
                      >
                        <option value="">
                          {areasLoading
                            ? "Loading…"
                            : areasError
                            ? `Failed: ${areasError}`
                            : "Select area"}
                        </option>
                        {areas.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-600 mt-1">
                        {row.areaId
                          ? `Mapped to areaId: ${row.areaId}`
                          : "No area selected yet"}
                      </div>
                    </label>

                    {/* startAt (initial only) */}
                    {mode === "initial" && (
                      <label className="flex flex-col gap-1">
                        <span className="text-sm">startAt (optional)</span>
                        <input
                          type="number"
                          min={1}
                          value={row.startAt ?? ""}
                          onChange={(e) =>
                            updateFileMeta(idx, {
                              startAt: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          className="rounded-lg px-3 py-2"
                          placeholder="1"
                        />
                      </label>
                    )}

                    {/* Day + Date (multi only) */}
                    {mode === "multi" && (
                      <>
                        <label className="flex flex-col gap-1">
                          <span className="text-sm">Day</span>
                          <select
                            value={row.dayId || ""}
                            onChange={(e) =>
                              updateFileMeta(idx, { dayId: e.target.value })
                            }
                            className="rounded-lg px-3 py-2"
                            disabled={daysLoading || !!daysError}
                          >
                            <option value="">
                              {daysLoading
                                ? "Loading…"
                                : daysError
                                ? `Failed: ${daysError}`
                                : "Select day"}
                            </option>
                            {days.map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.name || d.title || d._id}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="text-sm">Shipment Date</span>
                          <input
                            type="date"
                            value={row.date || ""}
                            onChange={(e) =>
                              updateFileMeta(idx, { date: e.target.value })
                            }
                            className="rounded-lg px-3 py-2"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            disabled={!readyToSubmit || submitting}
            onClick={onSubmit}
            className="btn btn-primary"
          >
            {submitting
              ? "Uploading…"
              : mode === "initial"
              ? "Upload & Seed Initial Orders"
              : "Upload Multi-Shipments"}
          </button>
          <button
            onClick={() => setServerResult(null)}
            className="btn btn-outline"
          >
            Reset Result
          </button>
        </div>
      </div>

      {/* Result */}
      {serverError && (
        <div className="alert">
          <div className="font-medium mb-1">Upload failed</div>
          <pre className="text-xs whitespace-pre-wrap">{serverError}</pre>
        </div>
      )}

      {serverResult && (
        <div className="rounded-2xl shadow p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Server Result</h2>

          {/* Render a reasonable view for both shapes */}
          {mode === "initial" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl p-4">
                  <div className="text-sm text-gray-600">Shipment</div>
                  <div className="font-medium">{serverResult.shipmentId}</div>
                </div>
                <div className="rounded-xl p-4">
                  <div className="text-sm text-gray-600">Meta</div>
                  <div className="text-sm">
                    Date:{" "}
                    <span className="font-medium">{serverResult.date}</span>
                  </div>
                  <div className="text-sm">
                    Company:{" "}
                    <span className="font-medium">
                      {serverResult.companyId}
                    </span>
                  </div>
                  <div className="text-sm">
                    Currency:{" "}
                    <span className="font-medium">{serverResult.currency}</span>
                  </div>
                  <div className="text-sm">
                    ProductId:{" "}
                    <span className="font-medium">
                      {serverResult.productId}
                    </span>
                  </div>
                  <div className="text-sm">
                    UnitPriceUSD:{" "}
                    <span className="font-medium">
                      {serverResult.unitPriceUSD}
                    </span>
                  </div>
                </div>
              </div>

              {Array.isArray(serverResult.areas) &&
                serverResult.areas.map((a: any, i: number) => (
                  <div key={i} className="mb-6 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-gray-50">
                      <div className="flex flex-wrap items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">File</div>
                          <div className="font-medium">{a.file}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Area</div>
                          <div className="font-medium">{a.areaId}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Rows</div>
                          <div className="font-medium">
                            {a.normalizedRows} / {a.rawRows}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Sequence</div>
                          <div className="font-medium">
                            {a.created?.firstSequence} →{" "}
                            {a.created?.lastSequence}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* … keep your existing table blocks … */}
                  </div>
                ))}
            </>
          ) : (
            <>
              <div className="rounded-xl p-4 mb-4">
                <div className="text-sm">
                  Product:{" "}
                  <span className="font-medium">
                    {serverResult.productCode}
                  </span>
                </div>
                <div className="text-sm">
                  LBP Rate:{" "}
                  <span className="font-medium">
                    {serverResult.exchangeRateLBP}
                  </span>
                </div>
              </div>

              {Array.isArray(serverResult.shipments) &&
                serverResult.shipments.map((s: any, idx: number) => (
                  <div key={idx} className="border rounded p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">File: {s.filename}</div>
                      <div className="text-sm opacity-70">
                        Shipment ID: {s.shipmentId}
                      </div>
                    </div>
                    {s.error ? (
                      <div className="mt-2 text-red-600">{s.error}</div>
                    ) : (
                      <>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          <div>
                            Area:{" "}
                            <span className="font-medium">{s.areaId}</span>
                          </div>
                          <div>
                            Day: <span className="font-medium">{s.dayId}</span>
                          </div>
                          <div>
                            Date: <span className="font-medium">{s.date}</span>
                          </div>
                          <div>
                            Rows:{" "}
                            <span className="font-medium">
                              {s.rowsProcessed}
                            </span>
                          </div>
                          <div>
                            Orders:{" "}
                            <span className="font-medium">
                              {s.createdOrders}
                            </span>
                          </div>
                        </div>
                        {Array.isArray(s.orders) && s.orders.length > 0 && (
                          <div className="mt-4 overflow-auto">
                            <table className="w-full text-sm border">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="p-2 border">Customer</th>
                                  <th className="p-2 border">Delivered</th>
                                  <th className="p-2 border">Returned</th>
                                  <th className="p-2 border">Checkout (USD)</th>
                                  <th className="p-2 border">Paid (USD)</th>
                                  <th className="p-2 border">Total (USD)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.orders.map((o: any) => (
                                  <tr key={o.orderId}>
                                    <td className="p-2 border">
                                      {o.customerName}
                                    </td>
                                    <td className="p-2 border">
                                      {o.delivered}
                                    </td>
                                    <td className="p-2 border">{o.returned}</td>
                                    <td className="p-2 border">{o.checkout}</td>
                                    <td className="p-2 border">{o.paid}</td>
                                    <td className="p-2 border">{o.total}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {s.errors?.length > 0 && (
                          <div className="mt-3 text-sm">
                            <div className="font-medium">
                              Unmatched customers ({s.errors.length}):
                            </div>
                            <ul className="list-disc ml-5">
                              {s.errors.map((e: any, i: number) => (
                                <li key={i}>
                                  {e.row?.customer_name} — {e.reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
