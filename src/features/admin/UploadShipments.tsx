import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./InitialImportView.css";

export default function UploadShipmentsPerFile() {
  const token = useSelector((s) => s.user.token);
  const companyId = useSelector((s) => s.user.companyId);

  const [days, setDays] = useState([]);
  const [areas, setAreas] = useState([]);
  const [products, setProducts] = useState([]);
  const [productCode, setProductCode] = useState("");

  const [exchange, setExchange] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  const [files, setFiles] = useState([]); // [{file, areaId, dayId, date, previewCount, validationError}]
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const r = await fetch("http://localhost:5000/api/exchange-rate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await r.json();
      if (!r.ok || typeof json.exchangeRateInLBP !== "number") {
        throw new Error(json?.error || "Failed to load exchange rate");
      }
      setExchange(json); // { companyId, exchangeRateInLBP }
    } catch (e) {
      setError(e.message || "Failed to load exchange rate");
    } finally {
      setLoadingRate(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [daysRes, areasRes, productsRes] = await Promise.all([
          fetch("http://localhost:5000/api/days", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch("http://localhost:5000/api/areas/company", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`http://localhost:5000/api/products/company/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);
        setDays(Array.isArray(daysRes) ? daysRes : []);
        setAreas(Array.isArray(areasRes) ? areasRes : []);
        setProducts(Array.isArray(productsRes) ? productsRes : []);
        if (Array.isArray(productsRes) && productsRes.length && !productCode) {
          setProductCode(String(productsRes[0].id));
        }
      } catch {
        setError("Failed to load lists");
      }
      fetchExchangeRate();
    })();
  }, [companyId, token]);

  // pick multiple files in multiple rounds
  const onPickFiles = async (e) => {
    const input = e.currentTarget;
    const picked = input.files ? Array.from(input.files) : [];
    input.value = ""; // allow picking again later

    if (!picked.length) return;
    const enhanced = await Promise.all(
      picked.map(async (f) => {
        const row = {
          file: f,
          areaId: "",
          dayId: "",
          date: "",
          previewCount: null,
          validationError: null,
        };
        try {
          const text = await f.text();
          const parsed = JSON.parse(text);
          row.previewCount = Array.isArray(parsed)
            ? parsed.length
            : Array.isArray(parsed?.orders)
            ? parsed.orders.length
            : 0;
          if (!Array.isArray(parsed) && !Array.isArray(parsed?.orders)) {
            row.validationError = "JSON must be an array or { orders: [] }";
          }
        } catch (err) {
          row.validationError = `Invalid JSON: ${
            err?.message || "parse error"
          }`;
        }
        return row;
      })
    );
    setFiles((prev) => [...prev, ...enhanced]);
  };

  const updateFileMeta = (idx, patch) => {
    setFiles((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };
  const removeAt = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const readyToSubmit = useMemo(() => {
    if (!files.length) return false;
    if (!productCode) return false;
    if (!exchange?.exchangeRateInLBP) return false;
    for (const r of files) {
      if (!r.file || !r.areaId || !r.dayId || !r.date) return false; // require per-file day+date+area
      if (r.validationError) return false;
    }
    return true;
  }, [files, productCode, exchange]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setResponse(null);
    try {
      if (!files.length) throw new Error("No files selected");

      const fd = new FormData();
      const areaMap = {};
      const dayMap = {};
      const dateMap = {};
      const safe = (s) => String(s || "").replace(/[^\w-]/g, "_");

      files.forEach((row, idx) => {
        const safeName = `area_${safe(row.areaId)}__day_${safe(
          row.dayId
        )}__idx_${idx}.json`;
        // re-wrap with a safe name so map keys match exactly
        const renamed = new File([row.file], safeName, {
          type: row.file.type || "application/json",
        });
        fd.append("files", renamed, safeName);

        areaMap[safeName] = row.areaId;
        dayMap[safeName] = row.dayId;
        dateMap[safeName] = row.date; // YYYY-MM-DD
      });

      fd.append("productCode", String(productCode));
      fd.append("exchangeRateLBP", String(exchange.exchangeRateInLBP));
      fd.append("areaMap", JSON.stringify(areaMap));
      fd.append("dayMap", JSON.stringify(dayMap));
      fd.append("dateMap", JSON.stringify(dateMap));

      const res = await fetch(
        "http://localhost:5000/api/shipments/upload-multi-shipments",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // DO NOT set Content-Type
          body: fd,
        }
      );

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          `Non-JSON response (${res.status}). First bytes: ${text.slice(
            0,
            200
          )}`
        );
      }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResponse(json);
    } catch (err) {
      setError(err.message || "Upload error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Import Shipments (per-file Day & Area)
      </h1>

      {/* Exchange rate display */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-medium">Company LBP Exchange Rate</div>
          <div className="inline-flex items-center gap-2 border rounded px-3 py-2">
            <span className="opacity-70">LBP</span>
            <span className="font-semibold">
              {exchange?.exchangeRateInLBP
                ? exchange.exchangeRateInLBP.toLocaleString()
                : "—"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchExchangeRate}
          disabled={loadingRate}
          className={`px-3 py-2 rounded text-white ${
            loadingRate ? "bg-gray-400" : "bg-slate-700"
          }`}
        >
          {loadingRate ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Product select (shared) */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <label className="block">
          <span className="block mb-1">Product</span>
          <select
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} — {p.type} (${p.priceInDollars})
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* File picker */}
      <div className="border rounded p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Add JSON files</div>
            <div className="text-sm opacity-70">
              Each file becomes its own shipment.
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            multiple
            onChange={onPickFiles}
          />
        </div>
      </div>

      {/* Per-file cards */}
      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((row, idx) => (
            <div key={idx} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{row.file.name}</div>
                <button
                  className="text-sm text-red-600"
                  onClick={() => removeAt(idx)}
                >
                  Remove
                </button>
              </div>
              <div className="text-xs opacity-70 mt-1">
                {row.previewCount ?? "?"} rows •{" "}
                {row.validationError ? (
                  <span className="text-red-600">{row.validationError}</span>
                ) : (
                  "OK"
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <label className="block">
                  <span className="block mb-1">Area</span>
                  <select
                    value={row.areaId}
                    onChange={(e) =>
                      updateFileMeta(idx, { areaId: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select area</option>
                    {areas.map((a) => (
                      <option key={a._id || a.id} value={a._id || a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block mb-1">Day</span>
                  <select
                    value={row.dayId}
                    onChange={(e) =>
                      updateFileMeta(idx, { dayId: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select day</option>
                    {days.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.name || d.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block mb-1">Date</span>
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) =>
                      updateFileMeta(idx, { date: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!readyToSubmit || submitting}
        className={`mt-4 px-4 py-2 rounded text-white ${
          readyToSubmit ? "bg-blue-600" : "bg-gray-400"
        }`}
      >
        {submitting ? "Uploading…" : "Submit"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 whitespace-pre-wrap">{error}</div>
      )}

      {response && (
        <div className="mt-8 space-y-6">
          <div className="border rounded p-4">
            <div className="font-bold text-lg">Upload Summary</div>
            <div className="mt-2 text-sm">
              <div>Product: {response.productCode}</div>
              <div>LBP Rate: {response.exchangeRateLBP}</div>
            </div>
          </div>

          {response.shipments?.map((s, idx) => (
            <div key={idx} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">File: {s.filename}</div>
                <div className="text-sm opacity-70">
                  Shipment ID: {s.shipmentId}
                </div>
              </div>
              {/* ... keep your table/summary as before ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
