import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  return (
    <main
      style={{
        padding: "40px",
        backgroundColor: "#111",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>Allo Inventory System</h1>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid gray",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>{product.name}</h2>

          {product.inventory.map((inv) => (
            <div
              key={inv.id}
              style={{
                marginTop: "10px",
                padding: "10px",
                border: "1px solid #333",
              }}
            >
              <p>Warehouse: {inv.warehouse.name}</p>
              <p>Total Stock: {inv.totalStock}</p>
              <p>Reserved Stock: {inv.reservedStock}</p>
              <p>Available: {inv.totalStock - inv.reservedStock}</p>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}