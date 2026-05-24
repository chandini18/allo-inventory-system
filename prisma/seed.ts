import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // Create Products
  const laptop = await prisma.product.create({
    data: {
      name: "Laptop",
    },
  });

  const phone = await prisma.product.create({
    data: {
      name: "Phone",
    },
  });

  // Create Warehouses
  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
    },
  });

  // Create Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: laptop.id,
        warehouseId: warehouse1.id,
        totalStock: 10,
      },
      {
        productId: laptop.id,
        warehouseId: warehouse2.id,
        totalStock: 5,
      },
      {
        productId: phone.id,
        warehouseId: warehouse1.id,
        totalStock: 20,
      },
    ],
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });