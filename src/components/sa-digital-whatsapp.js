import { Desktop } from "@wxcc-desktop/sdk";
import { sendWebHook } from "./webHooks/sendWebHook.js";
import { notifications } from "./helpers/notifications.js";

const template = document.createElement("template");


export default class SaDigitalWhatsApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
    Desktop.config.init();
    this._addEventListeners();
  }

  _addEventListeners() {
    const sendBtn = this.shadowRoot.querySelector(".send-btn");

    sendBtn.addEventListener("click", () => this._handleSend());
  }


  async _handleSend() {
    const phone    = this.shadowRoot.querySelector(".phone").value.trim();
    const status   = this.shadowRoot.querySelectorAll(".status");

    if (!phone) {
      notifications(status, "Introduce un número de teléfono.", "#fde8e8");
      return;
    }

    const raw = JSON.stringify({
      waid:   phone,
    });

    const result = await sendWebHook("POST", raw, this.WebHook);
    if (result && result.response[0]?.code === "1002") {
      notifications(status, "WhatsApp enviado correctamente.", "#befade");
    } else {
      notifications(status, "Error al enviar el WhatsApp.", "#fde8e8");
    }
  }

  async render() {
        template.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          font-family: sans-serif;
        }

        .wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
        }

        .container {
          width: 360px;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #ffffff;
        }

        label {
          display: block;
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
        }

        input[type="tel"],
        select {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #333;
        }

        input[type="tel"]:focus,
        select:focus {
          border-color: #009cee;
        }

        .field {
          margin-bottom: 1.25rem;
        }

        .preview {
          display: none;
          font-size: 13px;
          color: #555;
          background: #f5f7fa;
          border-left: 3px solid #009cee;
          border-radius: 4px;
          padding: 10px 12px;
          margin-bottom: 1.25rem;
        }

        button {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          background: #009cee;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        button:hover {
          background: #007ec0;
        }

        .status {
          display: none;
          margin-top: 1rem;
          font-size: 13px;
          text-align: center;
          padding: 8px;
          border-radius: 8px;
        }
      </style>

      <div class="wrapper">
      <div class="container">
        <img src=${this.logo} class="logo" />
        <div class="field">
          <label for="phone">Número de teléfono</label>
          <input type="tel" class="phone" placeholder="34600000000" />
        </div>

        <div class="preview"></div>

        <button class="send-btn">Enviar WhatsApp</button>

        <div class="status"></div>
      </div>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("sa-digital-whatsapp", SaDigitalWhatsApp);