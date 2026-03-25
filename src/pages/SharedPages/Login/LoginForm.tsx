import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { loginUser } from "../../../features/auth/api";

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

    const response = await loginUser({ email, password });
    if (response.error || !response.data) {
      toast.error(
        response.error ||
          (typeof response.data?.message === "string"
            ? response.data.message
            : "بيانات الدخول غير صحيحة")
      );
      return;
    }

    toast.success("تم تسجيل الدخول بنجاح");
    localStorage.setItem("token", response.data.token);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="email"
        name="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={handleChange}
        required
        data-testid="login-email"
      />
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={handleChange}
          required
          data-testid="login-password"
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "إخفاء" : "إظهار"}
        </button>
      </div>
      <button type="submit" className="login-button" data-testid="login-submit">
        🔒 تسجيل الدخول
      </button>
    </form>
  );
}
