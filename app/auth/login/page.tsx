"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import BaseAlert from "@/components/base-alert";
import toast from "react-hot-toast";
import { MailIcon, LockIcon, Loader2 } from "lucide-react";
import { getSession } from "next-auth/react";


export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({
    type: "",
    message: "",
    isShow: false,
  }); 
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validasi langsung password
    if (name === 'password') {
      if (value.length < 8) {
        setErrors(prev => ({ ...prev, password: 'Minimal 8 karakter' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  }


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ type: "", message: "", isShow: false });

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setAlert({
        type: "error",
        message: res.error,
        isShow: true,
      });
      setIsLoading(false);
    } else {

      const session = await getSession();
      // const user = session?.user as any;
      const role = session?.user?.role;

      // Cek jika belum verifikasi (verifiedAt == null)
      // if (!user?.verifiedAt) {
      //   toast.error("Akun belum diverifikasi, silakan cek email OTP Anda.");
      //   setTimeout(() => {
      //     router.replace(`/auth/verify-otp?email=${email}`);
      //   }, 500);
      //   setIsLoading(false);
      //   return;
      // }

      toast.success("Login berhasil, selamat datang kembali!");

      let redirectTo = "/dashboard";
      switch (role) {
        case "admin":
          redirectTo = "/dashboard/admin";
          break;
        case "kader":
          redirectTo = "/dashboard/kader";
          break;
        case "ibu_hamil":
          redirectTo = "/dashboard/ibu-hamil";
          break;
        case "orang_tua_balita":
          redirectTo = "/dashboard/orang-tua-balita";
          break;
        default:
          redirectTo = "/dashboard";
      }

      setTimeout(() => {
        router.replace(redirectTo);
      }, 800);

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-green-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <div className="text-center">
          <img
            src="/logo3.png"
            alt="Logo Posyandu"
            className="h-20 w-20 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">LOGIN SIMADU</h2>
          <p className="text-sm text-gray-500">
            Sistem Informasi Manajemen Posyandu <br />UPTD Puskesmas Cikalapa
          </p>
        </div>

        {alert.isShow && <BaseAlert alert={alert} />}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <MailIcon className="w-5 h-5 absolute top-3 left-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleChange(e);
              }}
              placeholder="Password"
              required
              className={`w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
              }`}
            />
            <LockIcon className="w-5 h-5 absolute top-3 left-3 text-gray-400" />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition shadow-md font-semibold flex justify-center items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            <Link href="#" className="hover:underline">
              Lupa password?
            </Link>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-teal-600 hover:underline">
            Registrasi sekarang
          </Link>
          <br />
          <Link href="/" className="text-teal-600 hover:underline">
            kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
