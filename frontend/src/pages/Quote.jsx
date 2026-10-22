import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";
import { callFunction } from "../auth/backend.js";
import { formFor, isAvailable } from "./quoteForms.js";
import contact from "../data/contact.js";
import "./Quote.css";

// One isometric icon per service (same files as the Services page).
const icons = import.meta.glob("../assets/brand/icons/*.svg", { eager: true, query: "?url", import: "default" });
const iconFor = (id) => icons[`../assets/brand/icons/${id}.svg`];

export default function Quote() {
  const { t, language: lang } = useLanguage();
  const { quote, services, auth } = t;
  const { user, ready } = useAuth();
  const location = useLocation();
  const resultRef = useRef(null);

  const [service, setService] = useState((services.items.find((s) => isAvailable(s.id)) ?? services.items[0]).id);
  const [values, setValues] = useState({});
  const [forms, setForms] = useState({}); // per-service dropdown lists from the API (GET /quotes/forms)
  const [profiles, setProfiles] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const serviceTitle = (id) => services.items.find((s) => s.id === id)?.title ?? id;
  const money = (n, cur) =>
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const num = (n) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n);
  const fields = formFor(service);
  const pending = !isAvailable(service);
  const contactEmail = contact.emails[0]?.address;
  const profileForm = forms[service]?.profiles ?? [];
  const profileValue = (p) => profiles[service]?.[p.id] ?? p.default;
  const optionLabel = (o) => (o === "_" ? quote.none : o);

  const onServiceChange = (id) => {
    setService(id);
    setValues({});
    setError("");
  };

  useEffect(() => {
    if (!user) return;
    callFunction("quote", { action: "forms" })
      .then(setForms)
      .catch(() => {});
    supabase
      .from("quotes")
      .select("id, input, result, created_at")
      .order("id", { ascending: false })
      .then(({ data }) => setHistory(data ?? []));
  }, [user?.id]);

  if (!ready) return null;

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <p className="eyebrow">
            <IBeam />
            {quote.eyebrow}
          </p>
          <h1>{quote.title}</h1>
          <p>{quote.loginRequired}</p>
          <div className="quote__actions">
            <Link className="btn btn-primary" to="/connexion" state={{ from: location.pathname }}>
              {auth.loginTitle}
            </Link>
            <Link className="btn btn-outline" to="/inscription" state={{ from: location.pathname }}>
              {auth.signupTitle}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = { service };
      for (const f of fields) body[f.key] = Number(values[f.key]);
      if (profileForm.length) body.profiles = Object.fromEntries(profileForm.map((p) => [p.id, profileValue(p)]));
      const d = await callFunction("quote", { action: "create", ...body });
      setResult(d);
      setHistory((h) => [d, ...h]);
      // On narrow screens the result sits below the form: bring it into view.
      if (window.matchMedia("(max-width: 900px)").matches) {
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    } catch (err) {
      setError(err.status === 400 ? err.message : auth.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const r = result?.result;
  const heaviest = r?.lines ? Math.max(...r.lines.map((l) => l.kg)) : 0;

  return (
    <section className="section quote">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {quote.eyebrow}
        </p>
        <h1>{quote.title}</h1>

        <div className="quote__layout">
          <form className="qform" onSubmit={onSubmit}>
            <fieldset className="qstep">
              <legend className="qstep__title">
                <span className="qstep__num">1</span>
                {quote.stepService}
              </legend>
              <div className="qsel">
                {services.items.map((s) => (
                  <label className="qsel__option" key={s.id}>
                    <input
                      className="qsel__input"
                      type="radio"
                      name="service"
                      value={s.id}
                      checked={service === s.id}
                      onChange={() => onServiceChange(s.id)}
                    />
                    <span className="qsel__card">
                      {iconFor(s.id) ? (
                        <img src={iconFor(s.id)} alt="" aria-hidden="true" className="qsel__icon" />
                      ) : (
                        <IBeam />
                      )}
                      <span className="qsel__name">{s.title}</span>
                      {!isAvailable(s.id) && <span className="qsel__badge">{quote.pendingBadge}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {pending ? (
              <div className="qpending">
                <h3>{quote.pendingTitle}</h3>
                <p>{quote.pendingText}</p>
                {contactEmail && (
                  <a className="btn btn-outline" href={`mailto:${contactEmail}`}>
                    {quote.pendingCta}
                  </a>
                )}
              </div>
            ) : (
              <>
                <fieldset className="qstep">
                  <legend className="qstep__title">
                    <span className="qstep__num">2</span>
                    {quote.stepDetails}
                  </legend>
                  <div className="qfields">
                    {fields.map((f) => (
                      <label className="qfield" key={f.key}>
                        <span className="qfield__label">{quote.fields[f.key]}</span>
                        <span className="qfield__control">
                          <input
                            type="number"
                            inputMode="decimal"
                            min={f.min}
                            max={f.max}
                            step={f.step}
                            value={values[f.key] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                            required
                          />
                          <span className="qfield__unit" aria-hidden="true">
                            {quote.units[f.unit]}
                          </span>
                        </span>
                        {f.min != null && f.max != null && (
                          <span className="qfield__hint">
                            <bdi dir="ltr">
                              {f.min} – {f.max}
                            </bdi>{" "}
                            {quote.units[f.unit]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {profileForm.length > 0 && (
                  <fieldset className="qstep">
                    <legend className="qstep__title">
                      <span className="qstep__num">3</span>
                      {quote.profilesTitle}
                    </legend>
                    <div className="qfields qfields--profiles">
                      {profileForm.map((p) => (
                        <label className="qfield" key={p.id}>
                          <span className="qfield__label">{quote.lines[p.id]}</span>
                          <select
                            className="qselect"
                            dir="ltr"
                            value={profileValue(p)}
                            onChange={(e) =>
                              setProfiles((all) => ({ ...all, [service]: { ...all[service], [p.id]: e.target.value } }))
                            }
                          >
                            {p.options.map((o) => (
                              <option key={o} value={o}>
                                {optionLabel(o)}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {error && (
                  <p className="qform__error" role="alert">
                    {error}
                  </p>
                )}
                <button className="btn btn-primary qform__submit" type="submit" disabled={busy}>
                  {busy ? auth.loading : quote.submit}
                </button>
              </>
            )}
          </form>

          <aside className="qresult-wrap" ref={resultRef} aria-live="polite">
            {r ? (
              <div className="qresult" key={result.id}>
                <p className="qresult__label">{quote.resultTitle}</p>
                <p className="qresult__service">{serviceTitle(result.input.service)}</p>
                <p className="qresult__total">{money(r.total, r.currency)}</p>
                <p className="qresult__total-label">{r.tax == null ? quote.totalExclTax : quote.total}</p>

                {r.surface != null && (
                  <div className="qresult__tiles qresult__tiles--1">
                    <div>
                      <strong>{num(r.surface)} {quote.units.m2}</strong>
                      <span>{quote.surface}</span>
                    </div>
                  </div>
                )}

                {r.steelKg != null && (
                  <div className="qresult__tiles">
                    <div>
                      <strong>{r.frames}</strong>
                      <span>{quote.frames}</span>
                    </div>
                    <div>
                      <strong>{num(r.steelKg)} {quote.units.kg}</strong>
                      <span>{quote.steel}</span>
                    </div>
                    <div>
                      <strong>{money(r.pricePerKg, r.currency)}</strong>
                      <span>{quote.pricePerKg}</span>
                    </div>
                  </div>
                )}

                {r.tax != null && (
                  <dl className="qresult__rows">
                    <dt>{quote.subtotal}</dt>
                    <dd>{money(r.subtotal, r.currency)}</dd>
                    {r.fodec != null && (
                      <>
                        <dt>{quote.fodec}</dt>
                        <dd>{money(r.fodec, r.currency)}</dd>
                      </>
                    )}
                    <dt>{quote.tax}</dt>
                    <dd>{money(r.tax, r.currency)}</dd>
                  </dl>
                )}
                <p className="qresult__note">{quote.placeholder}</p>
              </div>
            ) : (
              <div className="qresult qresult--empty">
                {iconFor(service) && <img src={iconFor(service)} alt="" aria-hidden="true" />}
                <p>{pending ? quote.pendingTitle : quote.resultEmpty}</p>
              </div>
            )}
          </aside>
        </div>

        {r?.lines && (
          <div className="qbreak">
            <h2 className="qsection-title">{quote.breakdown}</h2>
            <table className="qtable">
              <thead>
                <tr>
                  <th>{quote.itemCol}</th>
                  <th>{quote.profileCol}</th>
                  <th>{quote.units.kg}</th>
                </tr>
              </thead>
              <tbody>
                {r.lines.map((l) => (
                  <tr key={l.id}>
                    <td>{quote.lines[l.id] ?? l.id}</td>
                    <td dir="ltr">{l.profile}</td>
                    <td>
                      <span className="qtable__kg">
                        <span className="qtable__bar" aria-hidden="true">
                          <span style={{ width: `${heaviest ? (l.kg / heaviest) * 100 : 0}%` }} />
                        </span>
                        <span className="qtable__num">{num(l.kg)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="qsection-title">{quote.history}</h2>
        {history.length === 0 ? (
          <p>{quote.empty}</p>
        ) : (
          <ul className="qhistory">
            {history.map((q) => (
              <li key={q.id}>
                {iconFor(q.input.service) && <img src={iconFor(q.input.service)} alt="" aria-hidden="true" />}
                <span className="qhistory__name">{serviceTitle(q.input.service)}</span>
                <span className="qhistory__kg">
                  {q.input.surface != null
                    ? `${num(q.input.surface)} ${quote.units.m2}`
                    : `${num(q.result.steelKg ?? q.input.weightKg)} ${quote.units.kg}`}
                </span>
                <strong>{money(q.result.total, q.result.currency)}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
