import React, { useMemo, useState } from "react";
import "./InitialImportView.css";


/**
 * Multi-area Initial Import View
 * ------------------------------------------------------------
 * Purpose:
 *  - Let admins upload multiple JSON files (each file = one area) to seed an initial shipment.
 *  - Each file must be mapped to an areaId; optional per-file startAt may be provided.
 *  - Shared fields across all files: date, currency, productType/productCode, defaultReturn.
 *  - Posts multipart/form-data to the backend controller (upload.array("files")) at `endpoint`.
 *
 * Props:
 *  - endpoint: string (defaults to "/api/upload-initials")
 *  - presetDate?: string (YYYY-MM-DD) optional default date
 *  - presetCurrency?: "USD" | "LBP"
 *
 * Backend expectations:
 *  - Route configured as: router.post("/upload-initials", upload.array("files"), createInitialShipmentAndImportMultipleAreas)
 *  - Controller expects:
 *      files[]       -> multiple JSON files
 *      date          -> YYYY-MM-DD
 *      currency      -> USD | LBP (default USD)
 *      productType   -> optional
 *      productCode   -> optional (numeric id)
 *      defaultReturn -> number (default 2)
 *      areaMap       -> JSON string mapping filename -> areaId
 *      startAtMap    -> JSON string mapping filename -> startAt (optional)
 *
 * Notes:
 *  - companyId is derived server-side from req.user.companyId (auth). No need to send in the body.
 */
export default function InitialImportView({
  endpoint = "/api/upload-initials",
  presetDate,
  presetCurrency = "USD",
}: {
  endpoint?: string;
  presetDate?: string;
  presetCurrency?: "USD" | "LBP";
}) {
  type FileRow = {
    file: File;
    areaId: string;
    startAt?: number;
    previewCount?: number | null;
    validationError?: string | null;
  };

  const [date, setDate] = useState<string>(presetDate || new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState<"USD" | "LBP">(presetCurrency);
  const [defaultReturn, setDefaultReturn] = useState<number>(2);
  const [productType, setProductType] = useState<string>("Bottles");
  const [productCode, setProductCode] = useState<string>("");

  const [files, setFiles] = useState<FileRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const totalFiles = files.length;
  const readyToSubmit = useMemo(() => {
    if (!date) return false;
    if (!totalFiles) return false;
    for (const f of files) {
      if (!f.areaId || !f.file) return false;
      if (f.validationError) return false;
    }
    return true;
  }, [date, totalFiles, files]);

  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const list = e.target.files;
    if (!list) return;

    const fresh: FileRow[] = [];
    for (const f of Array.from(list)) {
      const row: FileRow = { file: f, areaId: "", startAt: undefined, previewCount: null, validationError: null };
      // quick client-side validation: JSON & array
      try {
        const text = await f.text();
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
    // reset input so the same files can be picked again later if needed
    e.currentTarget.value = "";
  };

  const updateFileMeta = (idx: number, patch: Partial<FileRow>) => {
    setFiles((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => {
    setFiles([]);
    setServerResult(null);
    setServerError(null);
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setServerError(null);
      setServerResult(null);

      const fd = new FormData();

      // Attach files (field name MUST be "files")
      files.forEach((row) => fd.append("files", row.file, row.file.name));

      // Build areaMap (filename -> areaId)
      const areaMap: Record<string, string> = {};
      files.forEach((row) => {
        areaMap[row.file.name] = row.areaId;
      });

      // Optional startAt map
      const startAtMap: Record<string, number> = {};
      files.forEach((row) => {
        if (typeof row.startAt === "number" && Number.isFinite(row.startAt)) {
          startAtMap[row.file.name] = row.startAt;
        }
      });

      fd.append("date", date);
      fd.append("currency", currency);
      if (productType) fd.append("productType", productType);
      if (productCode) fd.append("productCode", productCode);
      fd.append("defaultReturn", String(defaultReturn));
      fd.append("areaMap", JSON.stringify(areaMap));
      if (Object.keys(startAtMap).length) fd.append("startAtMap", JSON.stringify(startAtMap));

      const resp = await fetch(endpoint, {
        method: "POST",
        body: fd,
        // credentials: "include", // uncomment if your auth requires cookies
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      setServerResult(data);
    } catch (err: any) {
      setServerError(err?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl shadow p-6 bg-white border">
        <h1 className="text-2xl font-semibold mb-4">Multi‑Area Initial Import</h1>
        <p className="text-sm text-gray-600 mb-6">
          Upload one <span className="font-medium">JSON</span> file per area. Map each file to an <code>areaId</code>. All files share the same <code>date</code>,
          <code>currency</code>, product, and <code>defaultReturn</code>. Sequences start at <code>1</code> per area unless overridden.
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
            <span className="text-sm font-medium">Product Type (optional)</span>
            <input
              type="text"
              placeholder="Bottles"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Product Code (optional)</span>
            <input
              type="text"
              placeholder="Numeric code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
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
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">JSON Files (multiple)</label>
          <input
            type="file"
            accept="application/json"
            multiple
            onChange={onPickFiles}
            className="block"
          />
        </div>

        {totalFiles > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Files ({totalFiles})</h2>
              <button onClick={clearAll} className="text-sm text-red-600 hover:underline">Clear all</button>
            </div>

            <div className="space-y-3">
              {files.map((row, idx) => (
                <div key={idx} className="border rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grow">
                      <div className="font-medium">{row.file.name}</div>
                      <div className="text-xs text-gray-500">{row.previewCount ?? "?"} rows</div>
                      {row.validationError && (
                        <div className="text-xs text-red-600 mt-1">{row.validationError}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeAt(idx)}
                      className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-50"
                    >Remove</button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-sm">areaId</span>
                      <input
                        type="text"
                        value={row.areaId}
                        onChange={(e) => updateFileMeta(idx, { areaId: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                        placeholder="64f..."
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm">startAt (optional)</span>
                      <input
                        type="number"
                        min={1}
                        value={row.startAt ?? ""}
                        onChange={(e) => updateFileMeta(idx, { startAt: e.target.value ? Number(e.target.value) : undefined })}
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
            className={`px-4 py-2 rounded-lg text-white ${readyToSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"}`}
          >
            {submitting ? "Uploading…" : "Upload & Seed Initial Orders"}
          </button>
          <button
            onClick={() => setServerResult(null)}
            className="px-4 py-2 rounded-lg border"
          >Reset Result</button>
        </div>
      </div>

      {/* Result */}
      {serverError && (
        <div className="rounded-2xl shadow p-4 bg-white border border-red-200">
          <div className="text-red-700 font-medium mb-1">Upload failed</div>
          <pre className="text-xs whitespace-pre-wrap text-red-700">{serverError}</pre>
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
              <div className="text-sm">Date: <span className="font-medium">{serverResult.date}</span></div>
              <div className="text-sm">Company: <span className="font-medium">{serverResult.companyId}</span></div>
              <div className="text-sm">Currency: <span className="font-medium">{serverResult.currency}</span></div>
              <div className="text-sm">ProductId: <span className="font-medium">{serverResult.productId}</span></div>
              <div className="text-sm">UnitPriceUSD: <span className="font-medium">{serverResult.unitPriceUSD}</span></div>
            </div>
          </div>

          {Array.isArray(serverResult.areas) && serverResult.areas.map((a: any, i: number) => (
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
                    <div className="font-medium">{a.normalizedRows} / {a.rawRows}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Sequence</div>
                    <div className="font-medium">{a.created?.firstSequence} → {a.created?.lastSequence}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded-xl p-4">
                  <div className="text-sm text-gray-600">Created Customers</div>
                  <div className="text-2xl font-semibold">{a.created?.customers ?? 0}</div>
                </div>
                <div className="border rounded-xl p-4">
                  <div className="text-sm text-gray-600">Created Orders</div>
                  <div className="text-2xl font-semibold">{a.created?.orders ?? 0}</div>
                </div>
                <div className="border rounded-xl p-4">
                  <div className="text-sm text-gray-600">Errors</div>
                  <div className="text-2xl font-semibold text-red-600">{(a.errors?.length || 0)}</div>
                </div>
              </div>

              {a.parseIssues?.length ? (
                <div className="px-4 pb-4">
                  <div className="text-sm font-medium mb-1">Parse Issues</div>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {a.parseIssues.map((p: any, idx: number) => (
                      <li key={idx}>Row {p.row}: {p.reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(a.errors?.length) ? (
                <div className="px-4 pb-4">
                  <div className="text-sm font-medium mb-1">Import Errors</div>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {a.errors.map((p: any, idx: number) => (
                      <li key={idx}>{p.row ? `Row ${p.row}: ` : ""}{p.reason || p.error || JSON.stringify(p)}</li>
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
                          <td className="px-3 py-2 whitespace-nowrap">{c.sequence}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{c.customer_name}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{c.phone}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{c.address}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{c.delivered}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{c.total}</td>
                          <td className="px-3 py-2 text-gray-600">{c.customerId}</td>
                          <td className="px-3 py-2 text-gray-600">{c.orderId}</td>
                          <td className="px-3 py-2 text-gray-600">{c.notes}</td>
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
