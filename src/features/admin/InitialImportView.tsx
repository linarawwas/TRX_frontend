import React, { useEffect, useMemo, useState } from "react";
import "./InitialImportView.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

/**
 * InitialImportView — Multi‑Area Initial Import UI (JSON‑only)
 * ------------------------------------------------------------
 * New additions per request:
 *  - Fetch company Areas and show a dropdown per file → selecting an Area name ties its _id to that file.
 *  - Fetch company Products and show a single dropdown for the shipment → selecting a Product sets its numeric `id` (NOT _id).
 *
 * Props:
 *  - endpoint?: string                     → POST /upload-initials (multipart)
 *  - areasEndpoint?: string                → GET  /areas (company scoped)
 *  - productsEndpoint?: string             → GET  /products (company scoped)
 *  - presetDate?: string (YYYY-MM-DD)
 *  - presetCurrency?: 'USD' | 'LBP'
 *
 * Server expectations (unchanged):
 *  - Multer route: upload.array('files')
 *  - Controller body fields: date, currency, defaultReturn, areaMap, startAtMap, productCode
 */
export default function InitialImportView({
  companyId,
  endpoint = "http://localhost:5000/api/adminUpload/upload-initials",
  areasEndpoint, // no default here
  productsEndpoint, // no default here
  presetDate,
  presetCurrency = "USD",
}: {
  companyId?: string;
  endpoint?: string;
  areasEndpoint?: string;
  productsEndpoint?: string;
  presetDate?: string;
  presetCurrency?: "USD" | "LBP";
}) {
  const resolvedAreasEndpoint =
    areasEndpoint || "http://localhost:5000/api/areas/company"; // server infers company from auth

  const resolvedProductsEndpoint =
    productsEndpoint ||
    (companyId
      ? `http://localhost:5000/api/products/company/${companyId}`
      : "http://localhost:5000/api/products/company");
  type Area = { _id: string; name: string };
  type Product = {
    _id?: string;
    id: number;
    name?: string;
    type?: string;
    priceInDollars?: number;
  };
  type FileRow = {
    file: File;
    areaId: string; // selected from dropdown
    startAt?: number;
    previewCount?: number | null;
    validationError?: string | null;
  };
  const token = useSelector((state: RootState) => state.user.token);

  const [date, setDate] = useState<string>(
    presetDate || new Date().toISOString().slice(0, 10)
  );
  const [currency, setCurrency] = useState<"USD" | "LBP">(presetCurrency);
  const [defaultReturn, setDefaultReturn] = useState<number>(2);

  // Products: user must choose ONE; we'll send productCode=product.id
  const [products, setProducts] = useState<Product[]>([]);
  const [productCode, setProductCode] = useState<number | "">("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Areas for dropdown per-file
  const [areas, setAreas] = useState<Area[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areasError, setAreasError] = useState<string | null>(null);

  // Files table
  const [files, setFiles] = useState<FileRow[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  async function fetchJsonSafe(url: string, init?: RequestInit) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init?.headers || {}),
      },
      ...init,
      // credentials: "include", // uncomment if you use cookie auth
    });

    const ct = res.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) {
      const text = await res.text(); // capture HTML/error text for debugging
      const preview = text.slice(0, 200).replace(/\s+/g, " ").trim();
      throw new Error(
        `Non-JSON response (${res.status}). First bytes: ${preview}`
      );
    }

    if (!res.ok) {
      // still JSON but not OK -> show message
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // -------- Fetch Areas & Products (company-scoped via auth on server) --------
  // Areas
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setAreasLoading(true);
        setAreasError(null);

        const data = await fetchJsonSafe(resolvedAreasEndpoint, {
          method: "GET",
        });
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

  // Products
  useEffect(() => {
    let alive = true;
    // Skip until we have a usable endpoint
    if (
      !resolvedProductsEndpoint ||
      /undefined\b/.test(resolvedProductsEndpoint)
    )
      return;

    (async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        const data = await fetchJsonSafe(resolvedProductsEndpoint, {
          method: "GET",
        });
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

  // -------- Derived state --------
  const totalFiles = files.length;
  // 1) Under derived state:
  const uniqueNamesOk = useMemo(() => {
    const s = new Set(files.map((f) => f.file.name));
    return s.size === files.length;
  }, [files]);

  const readyToSubmit = useMemo(() => {
    if (!date) return false;
    if (!totalFiles) return false;
    if (productCode === "" || !Number.isFinite(Number(productCode)))
      return false;
    if (!uniqueNamesOk) return false; // <-- new
    if (productsLoading || productsError) return false; // <-- new
    for (const f of files) {
      if (!f.areaId || !f.file) return false;
      if (f.validationError) return false;
    }
    return true;
  }, [
    date,
    totalFiles,
    files,
    productCode,
    uniqueNamesOk,
    productsLoading,
    productsError,
  ]);

  // -------- File selection & per-file meta --------
  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    // keep a stable reference to the input
    const input = e.currentTarget as HTMLInputElement | null;
    if (!input) return;

    // copy the FileList immediately (before any await)
    const picked = input.files ? Array.from(input.files) : [];
    // optionally clear now; we already copied the files
    input.value = "";

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
        // quick MIME/extension sanity (optional, but nice UX)
        // if (f.type && f.type !== "application/json") throw new Error("File type must be JSON");
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          row.validationError = "JSON root must be an array.";
        } else {
          row.previewCount = parsed.length;
        }
      } catch (err: any) {
        row.validationError = `Invalid JSON: ${err?.message || "parse error"}`;
      }

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

  // -------- Submit --------
  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setServerError(null);
      setServerResult(null);

      // Basic guard, just in case
      if (!files.length) throw new Error("No files selected");

      const fd = new FormData();

      // Build maps based on *safe* filenames we control
      const areaMap: Record<string, string> = {};
      const startAtMap: Record<string, number> = {};
      const originalNames: string[] = [];

      // helper to make ASCII-safe file names and include areaId + index
      const mkSafeName = (areaId: string, idx: number) =>
        `area_${areaId || "unknown"}_${idx}.json`;

      // Append files with safe names
      files.forEach((row, idx) => {
        const safeName = mkSafeName(row.areaId, idx);
        originalNames.push(row.file.name);

        // Re-wrap file with our safeName (content unchanged)
        const renamed = new File([row.file], safeName, {
          type: row.file.type || "application/json",
        });
        fd.append("files", renamed, safeName);

        // Maps must use the *exact* same name
        areaMap[safeName] = row.areaId;
        if (typeof row.startAt === "number" && Number.isFinite(row.startAt)) {
          startAtMap[safeName] = row.startAt;
        }
      });

      // Required body fields
      fd.append("date", date);
      fd.append("currency", currency);
      fd.append("defaultReturn", String(defaultReturn));

      // Send the maps as JSON strings (server already expects these keys)
      fd.append("areaMap", JSON.stringify(areaMap));
      if (Object.keys(startAtMap).length) {
        fd.append("startAtMap", JSON.stringify(startAtMap));
      }

      // For easy debugging on the server (optional, safe to ignore server-side)
      fd.append("originalNames", JSON.stringify(originalNames));

      // Product (numeric id)
      if (productCode !== "") fd.append("productCode", String(productCode));

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
        // credentials: "include", // only if you use cookie auth
      });

      const ct = (resp.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("application/json")) {
        const text = await resp.text();
        throw new Error(`Upload error (${resp.status}): ${text.slice(0, 200)}`);
      }
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson?.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      setServerResult(data);
    } catch (err: any) {
      setServerError(err?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Render --------
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl shadow p-6 bg-white border initial-card">
        <h1 className="text-2xl font-semibold mb-4">
          Multi‑Area Initial Import
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Upload one <span className="font-medium">JSON</span> file per area.
          Map each file to an Area. All files share the same <code>date</code>,
          <code>currency</code>, chosen <code>product</code>, and{" "}
          <code>defaultReturn</code>. Sequences start at <code>1</code> per area
          unless overridden.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Shipment Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="USD">USD</option>
              <option value="LBP">LBP</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Default Return</span>
            <input
              type="number"
              min={0}
              value={defaultReturn}
              onChange={(e) => setDefaultReturn(Number(e.target.value))}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Product</span>
            <select
              value={productCode === "" ? "" : String(productCode)}
              onChange={(e) =>
                setProductCode(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="border rounded-lg px-3 py-2"
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
                  {p.name || p.type || `Code ${p.id}`}{" "}
                  {typeof p.priceInDollars === "number"
                    ? `— $${p.priceInDollars}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
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
                <div key={idx} className="border rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grow">
                      <div className="font-medium">{row.file.name}</div>
                      <div className="text-xs text-gray-500">
                        {row.previewCount ?? "?"} rows
                      </div>
                      {row.validationError && (
                        <div className="text-xs text-red-600 mt-1">
                          {row.validationError}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeAt(idx)}
                      className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-sm">Area</span>
                      <select
                        value={row.areaId}
                        onChange={(e) =>
                          updateFileMeta(idx, { areaId: e.target.value })
                        }
                        className="border rounded-lg px-3 py-2"
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
                        className="border rounded-lg px-3 py-2"
                        placeholder="1"
                      />
                    </label>
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
            className={`px-4 py-2 rounded-lg text-white ${
              readyToSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
            }`}
          >
            {submitting ? "Uploading…" : "Upload & Seed Initial Orders"}
          </button>
          <button
            onClick={() => setServerResult(null)}
            className="px-4 py-2 rounded-lg border"
          >
            Reset Result
          </button>
        </div>
      </div>

      {/* Result */}
      {serverError && (
        <div className="rounded-2xl shadow p-4 bg-white border border-red-200">
          <div className="text-red-700 font-medium mb-1">Upload failed</div>
          <pre className="text-xs whitespace-pre-wrap text-red-700">
            {serverError}
          </pre>
        </div>
      )}

      {serverResult && (
        <div className="rounded-2xl shadow p-6 bg-white border">
          <h2 className="text-xl font-semibold mb-4">Server Result</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-600">Shipment</div>
              <div className="font-medium">{serverResult.shipmentId}</div>
            </div>
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-600">Meta</div>
              <div className="text-sm">
                Date: <span className="font-medium">{serverResult.date}</span>
              </div>
              <div className="text-sm">
                Company:{" "}
                <span className="font-medium">{serverResult.companyId}</span>
              </div>
              <div className="text-sm">
                Currency:{" "}
                <span className="font-medium">{serverResult.currency}</span>
              </div>
              <div className="text-sm">
                ProductId:{" "}
                <span className="font-medium">{serverResult.productId}</span>
              </div>
              <div className="text-sm">
                UnitPriceUSD:{" "}
                <span className="font-medium">{serverResult.unitPriceUSD}</span>
              </div>
            </div>
          </div>

          {Array.isArray(serverResult.areas) &&
            serverResult.areas.map((a: any, i: number) => (
              <div key={i} className="mb-6 border rounded-2xl overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
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
                        {a.created?.firstSequence} → {a.created?.lastSequence}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border rounded-xl p-4">
                    <div className="text-sm text-gray-600">
                      Created Customers
                    </div>
                    <div className="text-2xl font-semibold">
                      {a.created?.customers ?? 0}
                    </div>
                  </div>
                  <div className="border rounded-xl p-4">
                    <div className="text-sm text-gray-600">Created Orders</div>
                    <div className="text-2xl font-semibold">
                      {a.created?.orders ?? 0}
                    </div>
                  </div>
                  <div className="border rounded-xl p-4">
                    <div className="text-sm text-gray-600">Errors</div>
                    <div className="text-2xl font-semibold text-red-600">
                      {a.errors?.length || 0}
                    </div>
                  </div>
                </div>

                {a.parseIssues?.length ? (
                  <div className="px-4 pb-4">
                    <div className="text-sm font-medium mb-1">Parse Issues</div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {a.parseIssues.map((p: any, idx: number) => (
                        <li key={idx}>
                          Row {p.row}: {p.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {a.errors?.length ? (
                  <div className="px-4 pb-4">
                    <div className="text-sm font-medium mb-1">
                      Import Errors
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {a.errors.map((p: any, idx: number) => (
                        <li key={idx}>
                          {p.row ? `Row ${p.row}: ` : ""}
                          {p.reason || p.error || JSON.stringify(p)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {Array.isArray(a.customers) && a.customers.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Seq</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Phone</th>
                          <th className="px-3 py-2 text-left">Address</th>
                          <th className="px-3 py-2 text-left">Delivered</th>
                          <th className="px-3 py-2 text-left">Total (USD)</th>
                          <th className="px-3 py-2 text-left">CustomerId</th>
                          <th className="px-3 py-2 text-left">OrderId</th>
                          <th className="px-3 py-2 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.customers.map((c: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2 whitespace-nowrap">
                              {c.sequence}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {c.customer_name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {c.phone}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {c.address}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {c.delivered}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {c.total}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {c.customerId}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {c.orderId}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {c.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
