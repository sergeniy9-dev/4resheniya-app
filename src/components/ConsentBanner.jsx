import { useEffect, useState } from "react";
import "../styles/consent.css";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("consent_accepted");

    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("consent_accepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="consent-banner">
      <p>
        Продолжая использование сайта, вы соглашаетесь
        с{" "}
        <a
          href="/docs/privacy.pdf"
          target="_blank"
          rel="noreferrer"
        >
          политикой конфиденциальности
        </a>{" "}
        и обработкой персональных данных.
      </p>

      <button onClick={handleAccept}>
        Понятно
      </button>
    </div>
  );
}