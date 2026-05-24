async function getProducts() {

  const res = await fetch(
    "http://localhost:3000/api/products",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Home() {

  const products = await getProducts();

  return (

    <main className="min-h-screen bg-gray-100 p-10 text-black">

      <h1 className="text-4xl font-bold mb-8">
        Allo Inventory System
      </h1>

      <div className="grid gap-6">

        {products.map((product: any) => (

          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md p-6"
          >

            <h2 className="text-2xl font-semibold mb-4">
              {product.name}
            </h2>

            <div className="space-y-4">

              {product.inventory.map((item: any) => (

                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >

                  <p className="mb-1">
                    <span className="font-semibold">
                      Warehouse:
                    </span>
                    {" "}
                    {item.warehouse.name}
                  </p>

                  <p className="mb-1">
                    <span className="font-semibold">
                      Total Stock:
                    </span>
                    {" "}
                    {item.totalStock}
                  </p>

                  <p className="mb-1">
                    <span className="font-semibold">
                      Reserved Stock:
                    </span>
                    {" "}
                    {item.reservedStock}
                  </p>

                  <p className="mb-1">
                    <span className="font-semibold">
                      Available Stock:
                    </span>
                    {" "}
                    {item.totalStock -
                      item.reservedStock}
                  </p>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}