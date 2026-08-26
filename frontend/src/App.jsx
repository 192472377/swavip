import { useEffect, useState } from "react";

export default function App() {
  const [stock, setStock] = useState([]);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    sku: "",
    qty: "",
    bin_id: "",
    reorder_level: "",
  });

  async function loadStock() {
    try {
      const res = await fetch("/api/inventory/stock");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStock(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addStock(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ sku: "", qty: "", bin_id: "", reorder_level: "" });
      loadStock();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadStock();
    const interval = setInterval(loadStock, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: "2rem", background: "#f4f6f9", minHeight: "100vh" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "1rem" }}>📦 SWAIVP — Inventory Dashboard</h1>

      {/* Error Message */}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>❌ Error loading stock: {error}</p>}

      {/* Add Stock Form */}
      <form onSubmit={addStock} style={{ marginBottom: "2rem", background: "#ffffff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#34495e" }}>➕ Add New Stock</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
            required
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            placeholder="Bin ID"
            value={form.bin_id}
            onChange={(e) => setForm({ ...form, bin_id: e.target.value })}
            required
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="number"
            placeholder="Reorder Level"
            value={form.reorder_level}
            onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
            required
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ background: "#27ae60", color: "white", padding: "0.6rem 1.2rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Add Stock
          </button>
        </div>
      </form>

      {/* Stock Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <thead style={{ background: "#2980b9", color: "white" }}>
          <tr>
            <th style={{ padding: "0.8rem" }}>SKU</th>
            <th style={{ padding: "0.8rem" }}>Qty</th>
            <th style={{ padding: "0.8rem" }}>Bin</th>
            <th style={{ padding: "0.8rem" }}>Reorder Level</th>
            <th style={{ padding: "0.8rem" }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr
              key={item.sku}
              style={{
                background: item.qty <= item.reorder_level ? "#fdecea" : "#ecf0f1",
                textAlign: "center",
              }}
            >
              <td style={{ padding: "0.6rem" }}>{item.sku}</td>
              <td style={{ padding: "0.6rem", fontWeight: "bold", color: item.qty <= item.reorder_level ? "#c0392b" : "#2c3e50" }}>
                {item.qty}
              </td>
              <td style={{ padding: "0.6rem" }}>{item.bin_id}</td>
              <td style={{ padding: "0.6rem" }}>{item.reorder_level}</td>
              <td style={{ padding: "0.6rem" }}>{new Date(item.last_updated).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {stock.length === 0 && !error && <p style={{ marginTop: "1rem", color: "#7f8c8d" }}>ℹ️ No stock records yet — add one above.</p>}
    </div>
  );
}
