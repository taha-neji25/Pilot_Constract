import { useState } from "react";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./FAQs.css";

export default function FAQs() {
  const { t } = useLanguage();
  const { faqs } = t;
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section className="section faqs">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {faqs.eyebrow}
        </p>
        <h1>{faqs.title}</h1>

        <ul className="faqs__list">
          {faqs.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li className="faq-item" key={item.q}>
                <button
                  className="faq-item__question"
                  aria-expanded={isOpen}
                  onClick={() => toggle(index)}
                >
                  <IBeam className={isOpen ? "faq-item__icon faq-item__icon--open" : "faq-item__icon"} />
                  <span>{item.q}</span>
                </button>
                {isOpen && <p className="faq-item__answer">{item.a}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
