import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { callFunction } from "./backend.js";

const AuthContext = createContext(null);

// profiles row (snake_case) -> the user object the pages use
const toUser = (p) => ({
  id: p.id,
  name: p.name,
  firstName: p.first_name,
  lastName: p.last_name,
  email: p.email,
  phone: p.phone,
  phoneCountry: p.phone_country,
  address: p.address,
  postalCode: p.postal_code,
  accountType: p.account_type,
  birthDate: p.birth_date,
  gender: p.gender,
  taxId: p.tax_id,
  position: p.position,
});

async function loadUser(session) {
  if (!session) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
  return data ? toUser(data) : null;
}

// true when this login is listed in the `admins` table (public.is_admin() answers for the current user only)
async function loadAdmin() {
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const apply = async (session) => {
      const u = await loadUser(session).catch(() => null);
      const admin = u ? await loadAdmin().catch(() => false) : false;
      if (!active) return;
      // keep the same object when nothing changed, so effects that depend on `user` do not re-run
      setUser((prev) => (JSON.stringify(prev) === JSON.stringify(u) ? prev : u));
      setIsAdmin(admin);
    };

    supabase.auth
      .getSession()
      .then(({ data }) => apply(data.session))
      .catch(() => {})
      .finally(() => active && setReady(true));

    // Do not call supabase from inside this callback directly (it can deadlock): defer with setTimeout.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => apply(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password,
    });
    if (error) {
      // an account whose e-mail code was never entered is locked by Supabase until it is verified
      const message =
        error.code === "email_not_confirmed" ? "Email not verified" : error.status === 400 ? "Invalid email or password" : "Request failed";
      const err = new Error(message);
      err.status = error.status;
      throw err;
    }
    const u = await loadUser(data.session);
    if (!u) {
      // A login without a profile did not come through the signup form: treat it as invalid.
      await supabase.auth.signOut();
      throw new Error("Invalid email or password");
    }
    setIsAdmin(await loadAdmin().catch(() => false));
    setUser(u);
  };

  // Returns { needsCode: true } when a verification code was e-mailed (the account stays locked until it is entered).
  const signup = async (fields) => {
    const d = await callFunction("signup", fields);
    if (d?.verification) return { needsCode: true };
    await login(fields.email, fields.password);
    return { needsCode: false };
  };

  // Checks the code, then logs in with the password typed at signup.
  const verifyEmail = async (email, code, password) => {
    await callFunction("signup", { action: "verify", email, code });
    await login(email, password);
  };

  const resendCode = (email, lang) => callFunction("signup", { action: "resend", email, lang });

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, ready, login, signup, verifyEmail, resendCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
