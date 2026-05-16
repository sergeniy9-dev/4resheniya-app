import "../styles/contacts.css";
import { useState } from "react";
import { sendLeadToCRM } from "../services/leadService";

export default function Contacts() {
    const [form, setForm] = useState({
  name: "",
  contact: "",
});

async function handleSubmit() {
  if (!form.name || !form.contact) {
    alert("Укажите имя и телефон.");
    return;
  }

  await sendLeadToCRM({
    source: "Форма консультации",
    name: form.name,
    contact: form.contact,
    message: "Пользователь нажал Получить консультацию",
  });

  alert("Заявка отправлена. Мы свяжемся с вами.");
}
  return (
    <section id="contacts" className="contacts reveal">
      <div className="contacts-wrap">
        <aside className="contacts-info">
          <p className="eyebrow">КОНТАКТЫ</p>

          <a href="tel:+74955322617" className="contacts-phone">
            +7 495 532-26-17
          </a>

          <div className="contacts-socials">
            <a href="https://instagram.com/USERNAME" target="_blank" rel="noreferrer">◎</a>
            <a href="https://wa.me/74955322617" target="_blank" rel="noreferrer">☘</a>
            <a href="https://t.me/USERNAME" target="_blank" rel="noreferrer">✈</a>
          </div>

          <div className="contacts-company">
            <p>ООО «ЧЕТЫРЕ РЕШЕНИЯ»</p>
            <p>ИНН 9725006609</p>
            <p>КПП 772501001</p>
            <p>ОГРН 1197746235400</p>
          </div>

          <div className="contacts-address">
<a
  className="contacts-map-link"
  href="https://yandex.ru/maps/-/CPg-NClQ"
  target="_blank"
  rel="noreferrer"
>
  г. Москва, Переведеновский переулок, д. 13, строение 13, помещ. 13
</a>            <a href="mailto:info@4solutions.ru">info@4solutions.ru</a>
          </div>

          <div className="contacts-links">
            <a href="/docs/offer.pdf" target="_blank">Договор оферты</a>
            <a href="/docs/user-agreement.pdf" target="_blank">Пользовательское соглашение</a>
            <a href="/docs/privacy.pdf" target="_blank">Политика конфиденциальности</a>
          </div>
        </aside>

        <div className="contacts-form">
          <h2>
            Получите консультацию
            <br />
            и ответы на все вопросы
          </h2>

          <p>
            Оставьте заявку — специалист свяжется с вами и подскажет следующий шаг.
          </p>

          <form>
            <label>
              Укажите имя
              <input
  placeholder="Ваше имя"
  value={form.name}
  onChange={(e) =>
    setForm((prev) => ({ ...prev, name: e.target.value }))
  }
/>
            </label>

            <label>
              Укажите телефон
              <input
  placeholder="+7 (000) 000-00-00"
  value={form.contact}
  onChange={(e) =>
    setForm((prev) => ({ ...prev, contact: e.target.value }))
  }
/>
            </label>

           <button type="button" onClick={handleSubmit}>
  Получить консультацию
</button>
          </form>
        </div>
      </div>
    </section>
  );
}