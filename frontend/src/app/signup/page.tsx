"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import AuthRedirect from "@/components/AuthRedirect/AuthRedirect";
import styles from "./signup.module.css";

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.register({ firstName, lastName, email, password, phone, role });
      router.push("/signin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthRedirect />
      <div className={styles.container}>
        <h2>Sign Up</h2>
        <div className={styles.noteContainer}>
          <p className={styles.note}>Choose your account type.</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>First Name</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={styles.input} />
          <label>Last Name</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={styles.input} />
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={styles.input} />
          <label>Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={styles.input} />
          
          <label>Account Type</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)} 
            className={styles.select}
          >
            <option value="user">Regular User</option>
            <option value="agent">Agent</option>
          </select>
          
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.button}>{loading ? "Signing up..." : "Sign Up"}</button>
        </form>
        <div className={styles.signinLink}>
          <p>Already have an account? <a href="/signin">Sign in</a></p>
        </div>
      </div>
    </>
  );
};

export default SignUpPage; 
 