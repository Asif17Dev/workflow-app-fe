"use client";
import { auth } from "@/lib/firebase";
import { setUser } from "@/redux/reducer/userReducer";
import { CircularProgress } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          dispatch(
            setUser({
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            })
          );
        } else {
          dispatch(setUser(null));
          router.replace("/login");
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <ToastContainer />
      {loading ? (
        <div className="bg-[#FDFBF6] h-screen flex items-center justify-center">
          <CircularProgress
            sx={{ margin: "auto", display: "block", color: "#1e1e1e" }}
            size={20}
          />
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default Wrapper;
