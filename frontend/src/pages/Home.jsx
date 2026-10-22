import IBeam from "../components/IBeam.jsx";
import Hero from "../components/Hero.jsx";
import Story from "../components/Story.jsx";
import Reveal from "../components/Reveal.jsx";
import CountUp from "../components/CountUp.jsx";
import PartnersCarousel from "../components/PartnersCarousel.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./Home.css";
import metaliana from "../../assets/logo/images.jpg"
import ceg from "../../assets/logo/socatra.png"
import socatra from "../../assets/logo/logo-ceg.png"
import global from "../../assets/logo/global acier.jpg"
import cofimas from "../../assets/logo/cofimas gros.jpg"
import soquibat from "../../assets/logo/soquibat-group.webp"
import mystere from "../../assets/logo/mystère.jpg"

export default function Home() {
  const { t } = useLanguage();
  const { home } = t;

  // Partner logos (frontend/assets/logo). To add one: import its image above and add a line here.
  const partners = [
    { name: "So.Ca.Tra", initials: "P1", image: socatra },
    { name: "CEG", initials: "P2", image: ceg },
    { name: "Metaliana", initials: "P3", image: metaliana },
    { name: "Global Acier", initials: "P4", image: global },
    { name: "Cofimas Gros", initials: "P5", image: cofimas },
    { name: "Soquibat Group", initials: "P6", image: soquibat },
    { name: "Mystère", initials: "P7", image: mystere },
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

          <Reveal>
            <PartnersCarousel
              partners={partners}
              pauseLabel={home.partnersPause}
              playLabel={home.partnersPlay}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
