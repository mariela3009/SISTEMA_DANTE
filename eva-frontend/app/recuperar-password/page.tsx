"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecuperarPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.email) {
          throw new Error("No existe ningún usuario con este correo electrónico.");
        }
        throw new Error(data.message || "Error al actualizar la contraseña.");
      }
      
      setMessage("¡Tu contraseña ha sido actualizada exitosamente!");
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream font-body-md text-body-md text-espresso min-h-screen w-full flex items-center justify-center relative overflow-hidden antialiased">
      <main className="w-full max-w-[420px] px-6 z-10 relative">
        <div className="text-center mb-10">
          <h1 className="font-headline-xl text-[40px] leading-[48px] font-bold text-espresso mb-2 tracking-tight">
            EVA
          </h1>
          <p className="font-body-lg text-[18px] text-on-surface-variant italic font-serif">
            Cambiar Contraseña
          </p>
        </div>

        <div className="bg-mist/90 backdrop-blur-md border border-latte/50 rounded-xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {message ? (
            <div className="text-center space-y-4">
              <div className="text-green-700 bg-green-100 p-4 rounded-lg font-semibold text-sm">
                {message}
              </div>
              <p className="text-sm text-on-surface-variant animate-pulse">Redirigiendo al login...</p>
              <Link href="/" className="inline-block mt-4 text-primary hover:text-espresso font-semibold transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <p className="text-sm text-on-surface-variant text-center mb-4">
                Ingresa tu correo y tu nueva contraseña para actualizarla inmediatamente.
              </p>
              
              <div>
                <label className="block font-label-lg text-[14px] font-semibold text-espresso mb-2">Correo Electrónico</label>
                <input
                  type="email" required
                  className="w-full px-3 py-3 bg-surface-container-lowest border border-latte/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@cafeteriadante.com"
                />
              </div>
              <div>
                <label className="block font-label-lg text-[14px] font-semibold text-espresso mb-2">Nueva Contraseña</label>
                <input
                  type="password" required minLength={6}
                  className="w-full px-3 py-3 bg-surface-container-lowest border border-latte/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block font-label-lg text-[14px] font-semibold text-espresso mb-2">Confirmar Contraseña</label>
                <input
                  type="password" required minLength={6}
                  className="w-full px-3 py-3 bg-surface-container-lowest border border-latte/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                  value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="text-error text-sm bg-error-container/50 p-3 rounded-lg text-center">{error}</div>}

              <button disabled={loading} type="submit" className="w-full py-3.5 px-4 rounded-lg shadow-sm font-semibold text-on-primary bg-primary hover:bg-terracota transition-all disabled:opacity-70">
                {loading ? "Procesando..." : "Actualizar Contraseña"}
              </button>

              <div className="text-center pt-2">
                <Link href="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Cancelar y volver
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
