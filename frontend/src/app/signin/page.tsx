"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthRedirect from "@/components/AuthRedirect/AuthRedirect";
import styles from "./signin.module.css";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      // Role-based redirect will be handled by AuthRedirect component
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle role-based redirect after successful login
  useEffect(() => {
    if (user && !loading) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'agent':
          router.push('/my-listings');
          break;
        case 'user':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, loading, router]);

  return (
    <>
      <AuthRedirect />
      <div className={styles.container}>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={styles.input} />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.button}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <div className={styles.signupLink}>
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>
    </>
  );
};

export default SignInPage; 
 