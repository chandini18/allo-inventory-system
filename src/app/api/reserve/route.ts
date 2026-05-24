import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const result = await prisma.$transaction(
      async (tx) => {

        const inventory = await tx.inventory.findFirst({
          where: {
            productId,
            warehouseId,
          },
        });

        if (!inventory) {
          throw new Error("Inventory not found");
        }

        const availableStock =
          inventory.totalStock -
          inventory.reservedStock;

        if (availableStock < quantity) {
          throw new Error("Not enough stock available");
        }

        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedStock: {
              increment: quantity,
            },
          },
        });

        const reservation =
          await tx.reservation.create({
            data: {
              productId,
              warehouseId,
              quantity,
              status: "RESERVED",
              expiresAt: new Date(
                Date.now() + 15 * 60 * 1000
              ),
            },
          });

        return reservation;
      }
    );

    return NextResponse.json({
      success: true,
      reservation: result,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        error: error.message ||
          "Reservation failed",
      },
      {
        status: 400,
      }
    );
  }
}