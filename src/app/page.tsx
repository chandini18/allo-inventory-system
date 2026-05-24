"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Inventory = {
  id: string;
  totalStock: number;
  reservedStock: number;
  warehouse: { id: string; name: string };
  productId: string;
};

type Product = {
  id: string;
  name: string;
  inventory: Inventory[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  async function handleReserve(productId: string, warehouseId: string) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Error ${res.status}: ${data.error}`);
      return;
    }

    router.push(`/reservations/${data.reservation.id}`);
  }

  if (loading) return <p style={{ color: "white", padding: "40px" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", padding: "40px" }}>{error}</p>;

  return (
    <main style={{ padding: "40px", backgroundColor: "#111", minHeight: "100vh", color: "white" }}>
      <h1 style={{ marginBottom: "30px" }}>Allo Inventory System</h1>

      {products.map((product) => (
        <div
          key={product.id}
          style={{ border: "1px solid gray", padding: "20px", marginBottom: "20px", borderRadius: "10px" }}
        >
          <h2>{product.name}</h2>

          {product.inventory.map((inv) => (
            <div
              key={inv.id}
              style={{ marginTop: "10px", padding: "10px", border: "1px solid #333" }}
            >
              <p>Warehouse: {inv.warehouse.name}</p>
              <p>Total Stock: {inv.totalStock}</p>
              <p>Reserved Stock: {inv.reservedStock}</p>
              <p>Available: {inv.totalStock - inv.reservedStock}</p>

              <button
                onClick={() => handleReserve(product.id, inv.warehouse.id)}
                disabled={inv.totalStock - inv.reservedStock === 0}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: inv.totalStock - inv.reservedStock === 0 ? "#555" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: inv.totalStock - inv.reservedStock === 0 ? "not-allowed" : "pointer",
                }}
              >
                {inv.totalStock - inv.reservedStock === 0 ? "Out of Stock" : "Reserve"}
              </button>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}