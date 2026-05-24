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
        throw { message: "Reservation already confirmed or released", status: 400 };
      }

      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          reservedStock: { decrement: reservation.quantity },
        },
      });

      return await tx.reservation.update({
        where: { id },
        data: { status: "RELEASED" },
      });
    });

    return NextResponse.json({ success: true, reservation: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Release failed" },
      { status: error.status || 400 }
    );
  }
}