import IBeam from "../components/IBeam.jsx";
import Hero from "../components/Hero.jsx";
import Story from "../components/Story.jsx";
import Reveal from "../components/Reveal.jsx";
import CountUp from "../components/CountUp.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./Home.css";
import metaliana from "../../assets/logo/images.jpg"
import ceg from "../../assets/logo/socatra.png"
import socatra from "../../assets/logo/logo-ceg.png"

export default function Home() {
  const { t } = useLanguage();
  const { home } = t;

  // Placeholder partners - replace with actual logos later
  const partners = [
    { name: "So.Ca.Tra", initials: "P1", image: socatra },
    { name: "CEG", initials: "P2", image: ceg },
    { name: "Metaliana", initials: "P3", image: metaliana },
  ];


  return (
    <>
      <Hero />

      <section className="section stats">
        <div className="container stats__grid">
          {home.stats.map((stat, i) => (
            <Reveal className="stats__item" key={stat.label} delay={i * 120}>
              <IBeam />
              <div>
                <CountUp className="stats__value" value={stat.value} />
                <span className="stats__label">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Scroll-driven process story: calculate, fabricate, install, hand over */}
      <Story />

      {/* About us */}
      <section className="section about" id="about">
        <div className="container">
          <Reveal className="about__header">
            <p className="eyebrow">
              <IBeam />
              {home.about.eyebrow}
            </p>
            <h2>{home.about.title}</h2>
            <p>{home.about.lead}</p>
          </Reveal>

          <div className="about__grid">
            {["foundation", "activity", "quality", "expertise"].map((key, i) => (
              <Reveal as="article" className="about-card" key={key} delay={(i % 2) * 120}>
                <IBeam />
                <h3>{home.about[key].title}</h3>
                <p>{home.about[key].text}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="about__values">
            <h3>{home.about.values.title}</h3>
            <ul className="about__values-list">
              {home.about.values.items.map((v) => (
                <li key={v.title}>
                  <strong>{v.title}</strong>
                  <span>{v.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="section partnership">
        <div className="container">
          <Reveal className="partnership__header">
            <p className="eyebrow">{home.partnershipEyebrow}</p>
            <h2>{home.partnershipTitle}</h2>
            <p>{home.partnershipText}</p>
          </Reveal>

          <div className="partnership__grid">
            {partners.map((partner, i) => (
              <Reveal key={partner.name} className="partnership__item" delay={i * 120}>
                <div className="partnership__placeholder">
                  <img src={partner.image} alt={partner.name} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
