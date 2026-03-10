import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE } from "../../../config/api";

export default function LoginForm(): JSX.Element {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl"); // Set right-to-left
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("تم تسجيل الدخول بنجاح");
        localStorage.setItem("token", data.token);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data?.message || "بيانات الدخول غير صحيحة");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.");
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={handleChange}
        required
      />
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={handleChange}
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "إخفاء" : "إظهار"}
        </button>
      </div>
      <button type="submit" className="login-button">
        🔒 تسجيل الدخول
      </button>
    </form>
  );
}
