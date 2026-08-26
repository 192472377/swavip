import { useEffect, useState } from "react";

export default function App() {
  const [stock, setStock] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadStock();
    const interval = setInterval(loadStock, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>SWAIVP — Inventory Dashboard</h1>
      {error && <p style={{ color: "red" }}>Error loading stock: {error}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Qty</th>
            <th>Bin</th>
            <th>Reorder Level</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.sku} style={{ background: item.qty <= item.reorder_level ? "#d95041" : "white" }}>
              <td>{item.sku}</td>
              <td>{item.qty}</td>
              <td>{item.bin_id}</td>
              <td>{item.reorder_level}</td>
              <td>{new Date(item.last_updated).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {stock.length === 0 && !error && <p>No stock records yet — add one via the API.</p>}
    </div>
  );
}
