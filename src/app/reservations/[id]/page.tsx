"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReservation(data);
        const diff = Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      })
      .catch(() => setError("Failed to load reservation"));
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  async function handleConfirm() {
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(`Error ${res.status}: ${data.error}`);
      return;
    }
    setMessage("Purchase confirmed!");
    setReservation((prev) => prev ? { ...prev, status: "CONFIRMED" } : prev);
  }

  async function handleRelease() {
    const res = await fetch(`/api/reservations/${id}/release`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(`Error ${res.status}: ${data.error}`);
      return;
    }
    setMessage("Reservation cancelled.");
    setReservation((prev) => prev ? { ...prev, status: "RELEASED" } : prev);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (error) return <p style={{ color: "red", padding: "40px" }}>{error}</p>;
  if (!reservation) return <p style={{ color: "white", padding: "40px" }}>Loading...</p>;

  return (
    <main style={{ padding: "40px", backgroundColor: "#111", minHeight: "100vh", color: "white" }}>
      <h1 style={{ marginBottom: "30px" }}>Reservation Details</h1>

      <div style={{ border: "1px solid gray", padding: "20px", borderRadius: "10px", maxWidth: "400px" }}>
        <p>Reservation ID: {reservation.id}</p>
        <p>Quantity: {reservation.quantity}</p>
        <p>Status: <strong>{reservation.status}</strong></p>

        {reservation.status === "RESERVED" && (
          <p style={{ color: timeLeft < 60 ? "red" : "orange" }}>
            Expires in: {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
        )}

        {message && <p style={{ color: "lightgreen", marginTop: "10px" }}>{message}</p>}

        {reservation.status === "RESERVED" && timeLeft > 0 && (
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleConfirm}
              style={{ padding: "10px 20px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              Confirm Purchase
            </button>
            <button
              onClick={handleRelease}
              style={{ padding: "10px 20px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        )}

        {(reservation.status === "CONFIRMED" || reservation.status === "RELEASED") && (
          <button
            onClick={() => router.push("/")}
            style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Back to Products
          </button>
        )}
      </div>
    </main>
  );
}