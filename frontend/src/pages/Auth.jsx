import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import "./Auth.css";

// Keep in sync with server/auth.js
const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$/;

const DEFAULT_COUNTRY = "TN";

const isEmailValid = (v) => v.length <= 254 && EMAIL_RE.test(v.trim());
const isPostalValid = (v) => POSTAL_RE.test(v.trim());
const isPhoneValid = (value, country) =>
  Boolean(parsePhoneNumberFromString(value, country)?.isValid());

export default function Auth({ mode }) {
  const isSignup = mode === "signup";
  const { t, language } = useLanguage();
  const { auth } = t;
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/devis";

  const [form, setForm] = useState({
    accountType: "person",
    firstName: "",
    lastName: "",
    email: "",
    phoneCountry: DEFAULT_COUNTRY,
    phone: "",
    address: "",
    postalCode: "",
    birthDate: "",
    gender: "",
    taxId: "",
    position: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Country names in the current UI language, sorted alphabetically for that language.
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([language], { type: "region" });
    return getCountries()
      .map((code) => ({ code, name: names.of(code), dial: getCountryCallingCode(code) }))
      .sort((a, b) => a.name.localeCompare(b.name, language));
  }, [language]);

  if (user) return <Navigate to={redirectTo} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const blur = (key) => () => setTouched((tt) => ({ ...tt, [key]: true }));

  const onPhoneChange = (e) => {
    // Format as the user types, according to the selected country.
    const formatted = new AsYouType(form.phoneCountry).input(e.target.value);
    setForm({ ...form, phone: formatted });
  };

  const onCountryChange = (e) => {
    const phoneCountry = e.target.value;
    // Re-format the digits already typed using the new country's rules.
    const digits = form.phone.replace(/[^\d]/g, "");
    setForm({ ...form, phoneCountry, phone: new AsYouType(phoneCountry).input(digits) });
  };

  const fieldErrors = {
    email: form.email && !isEmailValid(form.email) ? auth.emailInvalid : "",
    phone: form.phone && !isPhoneValid(form.phone, form.phoneCountry) ? auth.phoneInvalid : "",
    postalCode: form.postalCode && !isPostalValid(form.postalCode) ? auth.postalInvalid : "",
  };
  const showError = (key) => (touched[key] && fieldErrors[key] ? fieldErrors[key] : "");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup && Object.values(fieldErrors).some(Boolean)) {
      setTouched({ email: true, phone: true, postalCode: true });
      return;
    }

    setBusy(true);
    try {
      if (isSignup) await signup(form);
      else await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(auth.errors[err.message] ?? auth.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const FieldError = ({ id, text }) =>
    text ? (
      <small id={id} className="auth__field-error" role="alert">
        {text}
      </small>
    ) : null;

  return (
    <section className="section auth">
      <div className={isSignup ? "container auth__container auth__container--wide" : "container auth__container"}>
        <p className="eyebrow">
          <IBeam />
          {t.nav.cta}
        </p>
        <h1>{isSignup ? auth.signupTitle : auth.loginTitle}</h1>

        <form className="auth__form" onSubmit={onSubmit}>
          {isSignup && (
            <>
              <fieldset className="auth__choice">
                <legend>{auth.accountType}</legend>
                {["person", "company"].map((type) => (
                  <label key={type} className="auth__radio">
                    <input
                      type="radio"
                      name="accountType"
                      value={type}
                      checked={form.accountType === type}
                      onChange={set("accountType")}
                    />
                    {auth[type]}
                  </label>
                ))}
              </fieldset>

              <div className="auth__row">
                <label>
                  {auth.firstName}
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={set("firstName")}
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label>
                  {auth.lastName}
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={set("lastName")}
                    autoComplete="family-name"
                    required
                  />
                </label>
              </div>
            </>
          )}

          <label>
            {auth.email}
            <input
              type="email"
              inputMode="email"
              value={form.email}
              onChange={set("email")}
              onBlur={blur("email")}
              autoComplete="email"
              aria-invalid={Boolean(isSignup && showError("email"))}
              required
            />
            {isSignup && <FieldError text={showError("email")} />}
          </label>

          {isSignup && (
            <>
              <div className="auth__row auth__row--phone">
                <label>
                  {auth.phoneCountry}
                  <select value={form.phoneCountry} onChange={onCountryChange}>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} (+{c.dial})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {auth.phone}
                  <span className="auth__phone">
                    <span className="auth__dial" dir="ltr">
                      +{getCountryCallingCode(form.phoneCountry)}
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      value={form.phone}
                      onChange={onPhoneChange}
                      onBlur={blur("phone")}
                      autoComplete="tel-national"
                      aria-invalid={Boolean(showError("phone"))}
                      required
                    />
                  </span>
                  <FieldError text={showError("phone")} />
                </label>
              </div>

              <label>
                {auth.address}
                <input
                  type="text"
                  value={form.address}
                  onChange={set("address")}
                  autoComplete="street-address"
                  required
                />
              </label>
              <label className="auth__short">
                {auth.postalCode}
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={set("postalCode")}
                  onBlur={blur("postalCode")}
                  autoComplete="postal-code"
                  maxLength={10}
                  aria-invalid={Boolean(showError("postalCode"))}
                  required
                />
                <FieldError text={showError("postalCode")} />
              </label>

              {form.accountType === "person" ? (
                <>
                  <label>
                    {auth.birthDate}
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={set("birthDate")}
                      min="1900-01-01"
                      max={new Date().toISOString().slice(0, 10)}
                      autoComplete="bday"
                      required
                    />
                  </label>
                  <fieldset className="auth__choice">
                    <legend>{auth.gender}</legend>
                    {["male", "female"].map((g) => (
                      <label key={g} className="auth__radio">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={form.gender === g}
                          onChange={set("gender")}
                          required
                        />
                        {auth[g]}
                      </label>
                    ))}
                  </fieldset>
                </>
              ) : (
                <>
                  <label>
                    {auth.taxId}
                    <input type="text" value={form.taxId} onChange={set("taxId")} required />
                  </label>
                  <label>
                    {auth.position}
                    <input
                      type="text"
                      value={form.position}
                      onChange={set("position")}
                      autoComplete="organization-title"
                      required
                    />
                  </label>
                </>
              )}
            </>
          )}

          <label>
            {auth.password}
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              required
            />
            {isSignup && <small>{auth.passwordHint}</small>}
          </label>

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? auth.loading : isSignup ? auth.signupSubmit : auth.loginSubmit}
          </button>
        </form>

        <p className="auth__switch">
          {isSignup ? auth.haveAccount : auth.noAccount}{" "}
          <Link to={isSignup ? "/connexion" : "/inscription"} state={location.state}>
            {isSignup ? auth.loginTitle : auth.signupTitle}
          </Link>
        </p>
      </div>
    </section>
  );
}
