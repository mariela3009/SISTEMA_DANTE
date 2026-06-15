"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirigir si ya hay sesión al montar o al darle "Atrás"
  useEffect(() => {
    if (localStorage.getItem("eva_token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.errors?.email?.[0] || data.message || "Error de autenticación";
        throw new Error(errorMsg);
      }

      // Guardar token y usuario
      localStorage.setItem("eva_token", data.access_token);
      localStorage.setItem("eva_user", JSON.stringify(data.user));

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream font-body-md text-body-md text-espresso min-h-screen w-full flex items-center justify-center relative overflow-hidden antialiased">
      {/* Decorative Organic Shape - Top Right */}
      <svg
        className="absolute -top-32 -right-32 w-[600px] h-[600px] text-terracota opacity-[0.15] transform rotate-45 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.4,-2.4C97.9,13.2,93,29.1,83.3,42.4C73.6,55.7,59.1,66.4,43.2,74.2C27.3,82,10,86.9,-6.2,88.4C-22.4,89.9,-37.4,88.1,-50.7,80.5C-64,72.9,-75.6,59.5,-82.9,44.1C-90.2,28.7,-93.2,11.3,-91,-5.1C-88.8,-21.5,-81.4,-36.9,-71.2,-49.6C-61,-62.3,-48.1,-72.3,-34,-79.6C-19.9,-86.9,-4.7,-91.5,10.6,-92.3C25.9,-93.1,41.2,-90.1,44.7,-76.4Z"
          fill="currentColor"
          transform="translate(100 100)"
        ></path>
      </svg>
      {/* Decorative Organic Shape - Bottom Left */}
      <svg
        className="absolute -bottom-48 -left-48 w-[500px] h-[500px] text-latte opacity-20 transform -rotate-12 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M39.9,-65.7C54.1,-60.5,69.6,-53.8,79.5,-41.8C89.4,-29.8,93.7,-12.5,91.3,4.1C88.9,20.7,79.8,36.6,67.8,48.8C55.8,61,40.9,69.5,25.3,75.1C9.7,80.7,-6.6,83.4,-22.3,79.9C-38,76.4,-53.1,66.7,-65.2,53.4C-77.3,40.1,-86.4,23.2,-87.3,5.9C-88.2,-11.4,-80.9,-29.1,-69.1,-43.3C-57.3,-57.5,-41,-68.2,-25.9,-72.8C-10.8,-77.4,3.1,-75.9,17,-73.4C30.9,-70.9,25.7,-70.9,39.9,-65.7Z"
          fill="currentColor"
          transform="translate(100 100)"
        ></path>
      </svg>
      
      {/* Main Login Container */}
      <main className="w-full max-w-[420px] px-6 z-10 relative">
        {/* Header / Logo */}
        <div className="text-center mb-10">
          <h1 className="font-headline-xl text-[40px] leading-[48px] font-bold text-espresso mb-2 tracking-tight">
            EVA
          </h1>
          <p className="font-body-lg text-[18px] text-on-surface-variant italic font-serif">
            Cafetería Dante
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-mist/90 backdrop-blur-md border border-latte/50 rounded-xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                className="block font-label-lg text-[14px] font-semibold text-espresso mb-2"
                htmlFor="email"
              >
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span
                    className="material-symbols-outlined text-on-surface-variant/60 group-focus-within:text-primary transition-colors"
                    style={{ fontSize: "20px" }}
                  >
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-latte/60 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-[16px] text-on-surface placeholder-on-surface-variant/40 transition-colors"
                  id="email"
                  name="email"
                  placeholder="usuario@cafeteriadante.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block font-label-lg text-[14px] font-semibold text-espresso"
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <a
                  className="font-label-md text-[12px] text-primary hover:text-espresso transition-colors"
                  href="/recuperar-password"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span
                    className="material-symbols-outlined text-on-surface-variant/60 group-focus-within:text-primary transition-colors"
                    style={{ fontSize: "20px" }}
                  >
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-latte/60 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-[16px] text-on-surface placeholder-on-surface-variant/40 transition-colors"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span
                    className="material-symbols-outlined text-on-surface-variant/60 hover:text-espresso transition-colors"
                    style={{ fontSize: "20px" }}
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
              </div>
            </div>
            
            
            {/* Error Message */}
            {error && (
              <div className="text-error text-[14px] bg-error-container/50 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm font-label-lg text-[14px] font-semibold text-on-primary bg-primary hover:bg-terracota focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-cream transition-all duration-200 disabled:opacity-70"
                type="submit"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="font-label-md text-[12px] text-on-surface-variant/60">
            Acceso exclusivo para personal autorizado.
          </p>
        </div>
      </main>
    </div>
  );
}
