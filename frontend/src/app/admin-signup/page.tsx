"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import styles from "./admin-signup.module.css";

const AdminSignupPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Create admin user directly (this bypasses the regular signup role restriction)
      const adminData = {
        firstName,
        lastName,
        email,
        password,
        phone,
        role: "admin" // Force admin role
      };
      
      await authAPI.register(adminData);
      setSuccess("Admin account created successfully! You can now sign in.");
      
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
      
    } catch (err: any) {
      setError(err.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.warning}>
        <h3>⚠️ Admin Account Creation</h3>
        <p>This page is for creating admin accounts only. Use with caution.</p>
      </div>
      
      <h2>Create Admin Account</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>First Name</label>
        <input 
          type="text" 
          value={firstName} 
          onChange={e => setFirstName(e.target.value)} 
          required 
          className={styles.input} 
        />
        
        <label>Last Name</label>
        <input 
          type="text" 
          value={lastName} 
          onChange={e => setLastName(e.target.value)} 
          required 
          className={styles.input} 
        />
        
        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className={styles.input} 
        />
        
        <label>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          className={styles.input} 
        />
        
        <label>Phone</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          className={styles.input} 
        />
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <button 
          type="submit" 
          disabled={loading} 
          className={styles.button}
        >
          {loading ? "Creating Admin..." : "Create Admin Account"}
        </button>
      </form>
      
      <div className={styles.links}>
        <a href="/signin">Back to Sign In</a>
        <a href="/">Back to Home</a>
      </div>
    </div>
  );
};

export default AdminSignupPage; 
 