import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw { message: "Reservation not found", status: 404 };
      }

      if (reservation.status !== "RESERVED") {
        throw { message: "Reservation is not in RESERVED state", status: 400 };
      }

      if (new Date() > reservation.expiresAt) {
        await tx.reservation.update({
          where: { id },
          data: { status: "EXPIRED" },
        });
        throw { message: "Reservation has expired", status: 410 };
      }

      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          totalStock: { decrement: reservation.quantity },
          reservedStock: { decrement: reservation.quantity },
        },
      });

      return await tx.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json({ success: true, reservation: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Confirm failed" },
      { status: error.status || 400 }
    );
  }
}