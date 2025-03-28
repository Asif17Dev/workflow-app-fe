"use client"; // Only needed for App Router (app directory)
import { InputHTMLAttributes, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/reducer/userReducer";
import Cookies from "js-cookie";

const Login = () => {
  const router = useRouter();
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const token = await user.getIdToken();
      Cookies.set("token", token, { expires: 7 });

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      dispatch(
        setUser({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        })
      );
      router.push("/");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCredentials((cred) => ({ ...cred, [name]: value }));
  };

  async function loginUser(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      alert(error.message);
      throw new Error(error.message);
    }
  }

  return (
    <div
      className="h-screen flex justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: "url(/login_bg.png)" }}
    >
      <div className="w-full h-full bg-gradient-to-r from-gray-900/80 to-gray-600/30">
        <div className="flex h-full w-full container mx-auto gap-10">
          <div className="text-white space-y-4  flex-1 h-full">
            <div className="max-w-[350px] mx-auto flex flex-col justify-center h-full">
              <img src="/logo_highbridge.svg" alt="" className="mb-20 w-3xs" />
              <h1 className="text-2xl font-bold mb-5">
                Building the Future...
              </h1>
              <p className="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-t-4xl flex-1 max-w-[460px] mt-40">
            <div className="mb-8">
              {" "}
              <p className="font-semibold text-sm">WELCOME BACK! </p>
              <h3 className="font-bold text-2xl">Log In to your Account</h3>
            </div>

            {/* <form
              onSubmit={() =>
                loginUser(credentials.email, credentials.password)
              }
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="" className="text-sm text-[#4F4F4F]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-white rounded-lg border border-slate-200 w-full h-10 px-4"
                    placeholder="Type here..."
                  />
                </div>
                <div className="">
                  <label htmlFor="" className="text-sm text-[#4F4F4F]">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-white rounded-lg border border-slate-200 w-full h-10 px-4"
                    placeholder="Type here..."
                    min={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 w-full h-10 rounded-lg bg-[#EE3425] text-white font-semibold"
              >
                Log In
              </button>
            </form>

            <div className="flex gap-3 items-center mt-5">
              <span className="border-t border-t-slate-200 flex-1"></span>
              <p>or</p>
              <span className="border-t border-t-slate-200 flex-1"></span>
            </div> */}

            <button
              onClick={handleGoogleLogin}
              className="px-2 py-2 bg-white cursor-pointer  text-slate-900  rounded-lg border border-slate-100 transition-all mt-5 flex items-center gap-10 w-full justify-between"
            >
              <img src="/icons8-google.svg" alt="" />
              Login with Google
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
