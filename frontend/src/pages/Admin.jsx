import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";
import "./Admin.css";

// Editable prices. Same keys and limits as the database table `pricing` (which enforces them too).
const PRICE_FIELDS = [
  { key: "framing_price_per_kg", unit: "tndKg", min: 0.01, max: 10000, step: "0.01" },
  { key: "calculation_rate_small", unit: "tndM2", min: 0.01, max: 10000, step: "0.01" },
  { key: "calculation_rate_large", unit: "tndM2", min: 0.01, max: 10000, step: "0.01" },
  { key: "calculation_threshold_m2", unit: "m2", min: 1, max: 50000, step: "1" },
];

export default function Admin() {
  const { t, language: lang, path } = useLanguage();
  const { admin: a, services, quote } = t;
  const { user, ready, isAdmin } = useAuth();

  const [tab, setTab] = useState("clients");
  const [data, setData] = useState({ profiles: [], quotes: [], pricing: [], history: [] });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [open, setOpen] = useState(null); // id of the expanded client / quote row
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { ok, text }

  const load = useCallback(async () => {
    setStatus("loading");
    const [profiles, quotes, pricing, history] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("id, user_id, input, result, created_at").order("id", { ascending: false }).limit(1000),
      supabase.from("pricing").select("key, value, updated_at, updated_by"),
      supabase.from("pricing_history").select("id, key, old_value, new_value, changed_by, changed_at").order("id", { ascending: false }).limit(30),
    ]);
    if (profiles.error || quotes.error || pricing.error || history.error) {
      setStatus("error");
      return;
    }
    setData({ profiles: profiles.data, quotes: quotes.data, pricing: pricing.data, history: history.data });
    setForm(Object.fromEntries(pricing.data.map((r) => [r.key, String(Number(r.value))])));
    setStatus("ready");
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const people = useMemo(() => new Map(data.profiles.map((p) => [p.id, p])), [data.profiles]);
  const quotesBy = useMemo(() => {
    const map = new Map();
    data.quotes.forEach((q) => map.set(q.user_id, [...(map.get(q.user_id) ?? []), q]));
    return map;
  }, [data.quotes]);
  const currentPrices = useMemo(() => Object.fromEntries(data.pricing.map((r) => [r.key, r])), [data.pricing]);

  if (!ready) return null;
  if (!user) return <Navigate to={path("login")} replace state={{ from: path("admin") }} />;
  if (!isAdmin) return <Navigate to={path("home")} replace />;

  const money = (n) =>
    new Intl.NumberFormat(lang, { style: "currency", currency: "TND", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const num = (n) => new Intl.NumberFormat(lang, { maximumFractionDigits: 3 }).format(n);
  const when = (iso) => new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  const serviceTitle = (id) => services.items.find((s) => s.id === id)?.title ?? id;
  const nameOf = (id) => people.get(id)?.name ?? "—";
  const summary = (q) =>
    q.input.surface != null
      ? `${num(q.input.surface)} ${quote.units.m2}`
      : q.input.length != null
        ? `${q.input.length} × ${q.input.width} × ${q.input.height} ${quote.units.m} · ${num(q.result.steelKg)} ${quote.units.kg}`
        : "";

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const lc = search.trim().toLowerCase();
  const clients = data.profiles.filter(
    (p) => !lc || [p.name, p.email, p.phone, p.address].some((v) => String(v ?? "").toLowerCase().includes(lc))
  );
  const allQuotes = data.quotes.filter(
    (q) =>
      (serviceFilter === "all" || q.input.service === serviceFilter) &&
      (!lc || nameOf(q.user_id).toLowerCase().includes(lc))
  );

  const QuoteDetail = ({ q }) => (
    <div className="admin__detail">
      {q.result.lines && (
        <ul className="admin__lines">
          {q.result.lines.map((l) => (
            <li key={l.id}>
              <span>{quote.lines[l.id] ?? l.id}</span>
              <bdi dir="ltr">{l.profile}</bdi>
              <span>
                {num(l.kg)} {quote.units.kg}
              </span>
            </li>
          ))}
        </ul>
      )}
      <dl className="admin__facts">
        {q.result.pricePerKg != null && (
          <>
            <dt>{quote.pricePerKg}</dt>
            <dd>{money(q.result.pricePerKg)}</dd>
          </>
        )}
        {q.result.tax != null && (
          <>
            <dt>{quote.subtotal}</dt>
            <dd>{money(q.result.subtotal)}</dd>
            {q.result.fodec != null && (
              <>
                <dt>{quote.fodec}</dt>
                <dd>{money(q.result.fodec)}</dd>
              </>
            )}
            <dt>{quote.tax}</dt>
            <dd>{money(q.result.tax)}</dd>
          </>
        )}
        <dt>{q.result.tax == null ? quote.totalExclTax : quote.total}</dt>
        <dd>
          <strong>{money(q.result.total)}</strong>
        </dd>
      </dl>
    </div>
  );

  const quoteTable = (list, withClient) =>
    list.length === 0 ? (
      <p className="admin__empty">{a.noQuotes}</p>
    ) : (
      <div className="admin__scroll">
        <table className="admin__table">
          <thead>
            <tr>
              <th>{a.col.date}</th>
              {withClient && <th>{a.col.client}</th>}
              <th>{a.col.service}</th>
              <th>{a.col.details}</th>
              <th className="admin__num">{a.col.total}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((q) => {
              const key = `q${q.id}`;
              return (
                <Fragment key={q.id}>
                  <tr className={open === key ? "is-open" : ""}>
                    <td>{when(q.created_at)}</td>
                    {withClient && <td>{nameOf(q.user_id)}</td>}
                    <td>{serviceTitle(q.input.service)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin__more"
                        aria-expanded={open === key}
                        onClick={() => setOpen(open === key ? null : key)}
                      >
                        <bdi dir="ltr">{summary(q)}</bdi>
                      </button>
                    </td>
                    <td className="admin__num">{money(q.result.total)}</td>
                  </tr>
                  {open === key && (
                    <tr className="admin__expand">
                      <td colSpan={withClient ? 5 : 4}>
                        <QuoteDetail q={q} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );

  const changed = PRICE_FIELDS.filter((f) => Number(form[f.key]) !== Number(currentPrices[f.key]?.value));

  const savePrices = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (changed.length === 0) return setMessage({ ok: false, text: a.prices.nothing });
    for (const f of changed) {
      const v = Number(form[f.key]);
      if (form[f.key] === "" || !Number.isFinite(v) || v < f.min || v > f.max) return setMessage({ ok: false, text: a.prices.invalid });
    }
    setSaving(true);
    for (const f of changed) {
      const { error } = await supabase.from("pricing").update({ value: Number(form[f.key]) }).eq("key", f.key);
      if (error) {
        setSaving(false);
        await load();
        return setMessage({ ok: false, text: a.prices.error });
      }
    }
    await load();
    setSaving(false);
    setMessage({ ok: true, text: a.prices.saved });
  };

  return (
    <section className="section admin">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {a.eyebrow}
        </p>
        <h1>{a.title}</h1>

        {status === "error" && (
          <p className="admin__alert" role="alert">
            {a.loadError}{" "}
            <button type="button" className="admin__link" onClick={load}>
              {a.refresh}
            </button>
          </p>
        )}

        <div className="admin__stats">
          <div>
            <strong>{data.profiles.length}</strong>
            <span>{a.stats.clients}</span>
          </div>
          <div>
            <strong>{data.quotes.length}</strong>
            <span>{a.stats.quotes}</span>
          </div>
          <div>
            <strong>{data.quotes.filter((q) => new Date(q.created_at).getTime() > weekAgo).length}</strong>
            <span>{a.stats.week}</span>
          </div>
        </div>

        <div className="admin__tabs" role="tablist">
          {["clients", "quotes", "prices"].map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? "admin__tab is-active" : "admin__tab"}
              onClick={() => {
                setTab(id);
                setOpen(null);
                setSearch("");
              }}
            >
              {a.tabs[id]}
            </button>
          ))}
        </div>

        {status === "loading" && <p className="admin__empty">{a.loading}</p>}

        {status === "ready" && tab === "clients" && (
          <div role="tabpanel">
            <input
              className="admin__search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={a.search}
              aria-label={a.search}
            />
            {data.profiles.length === 0 ? (
              <p className="admin__empty">{a.noClients}</p>
            ) : clients.length === 0 ? (
              <p className="admin__empty">{a.noMatch}</p>
            ) : (
              <div className="admin__scroll">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>{a.col.name}</th>
                      <th>{a.col.phone}</th>
                      <th>{a.col.email}</th>
                      <th>{a.col.joined}</th>
                      <th className="admin__num">{a.col.quotes}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((p) => {
                      const mine = quotesBy.get(p.id) ?? [];
                      const key = `c${p.id}`;
                      return (
                        <Fragment key={p.id}>
                          <tr className={open === key ? "is-open" : ""}>
                            <td>
                              <button
                                type="button"
                                className="admin__more"
                                aria-expanded={open === key}
                                onClick={() => setOpen(open === key ? null : key)}
                              >
                                {p.name}
                              </button>
                              <span className="admin__badge">{a[p.account_type]}</span>
                            </td>
                            <td>
                              <a href={`tel:${p.phone}`} dir="ltr">
                                {p.phone}
                              </a>
                            </td>
                            <td>
                              <a href={`mailto:${p.email}`} dir="ltr">
                                {p.email}
                              </a>
                            </td>
                            <td>{when(p.created_at)}</td>
                            <td className="admin__num">{mine.length}</td>
                          </tr>
                          {open === key && (
                            <tr className="admin__expand">
                              <td colSpan={5}>
                                <dl className="admin__facts">
                                  <dt>{a.address}</dt>
                                  <dd>
                                    {p.address}, {p.postal_code}
                                  </dd>
                                  <dt>{a.country}</dt>
                                  <dd>{p.phone_country}</dd>
                                  {p.account_type === "person" ? (
                                    <>
                                      <dt>{a.birthDate}</dt>
                                      <dd>{p.birth_date}</dd>
                                      <dt>{a.gender}</dt>
                                      <dd>{a[p.gender]}</dd>
                                    </>
                                  ) : (
                                    <>
                                      <dt>{a.taxId}</dt>
                                      <dd>{p.tax_id}</dd>
                                      <dt>{a.position}</dt>
                                      <dd>{p.position}</dd>
                                    </>
                                  )}
                                </dl>
                                <h3 className="admin__sub">{a.clientQuotes}</h3>
                                {quoteTable(mine, false)}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {status === "ready" && tab === "quotes" && (
          <div role="tabpanel">
            <div className="admin__filters">
              <input
                className="admin__search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={a.searchQuotes}
                aria-label={a.searchQuotes}
              />
              <select className="admin__select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} aria-label={a.col.service}>
                <option value="all">{a.allServices}</option>
                {services.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            {allQuotes.length === 0 && data.quotes.length > 0 ? <p className="admin__empty">{a.noMatch}</p> : quoteTable(allQuotes, true)}
          </div>
        )}

        {status === "ready" && tab === "prices" && (
          <div role="tabpanel">
            <p className="admin__intro">{a.prices.intro}</p>
            <form className="admin__prices" onSubmit={savePrices}>
              {PRICE_FIELDS.map((f) => {
                const row = currentPrices[f.key];
                return (
                  <label key={f.key} className="admin__price">
                    <span className="admin__price-label">{a.prices[f.key]}</span>
                    <span className="admin__price-control">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                        required
                      />
                      <span className="admin__price-unit" aria-hidden="true">
                        {a.prices[f.unit]}
                      </span>
                    </span>
                    <span className="admin__price-note">
                      {a.prices.lastChange}:{" "}
                      {row?.updated_by ? `${when(row.updated_at)} · ${nameOf(row.updated_by)}` : a.prices.never}
                    </span>
                  </label>
                );
              })}
              {message && (
                <p className={message.ok ? "admin__ok" : "admin__alert"} role={message.ok ? "status" : "alert"}>
                  {message.text}
                </p>
              )}
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? a.prices.saving : a.prices.save}
              </button>
            </form>

            <h3 className="admin__sub">{a.prices.history}</h3>
            {data.history.length === 0 ? (
              <p className="admin__empty">{a.prices.historyEmpty}</p>
            ) : (
              <div className="admin__scroll">
                <table className="admin__table">
                  <tbody>
                    {data.history.map((h) => (
                      <tr key={h.id}>
                        <td>{when(h.changed_at)}</td>
                        <td>{a.prices[h.key]}</td>
                        <td dir="ltr">
                          {h.old_value == null ? "—" : num(h.old_value)} → <strong>{num(h.new_value)}</strong>
                        </td>
                        <td>{nameOf(h.changed_by)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
