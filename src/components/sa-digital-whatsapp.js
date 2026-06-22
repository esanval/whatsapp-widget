import { Desktop } from "@wxcc-desktop/sdk";
import { sendWebHook } from "./webHooks/sendWebHook.js";
import { getQueues } from "./api/getQueues.js";
import { getAgentIdByCiUserId } from "./api/getAgentIdByCiUserId.js";
import { searchContacts } from "./api/searchContacts.js";
import { notifications } from "./helpers/notifications.js";

export default class SaDigitalWhatsApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.orgId    = this["org-id"];
    // $STORE.agent.agentId actually holds the CI user id, not the agent-based-queues agent id
    this.ciUserId = this["user-id"];

    this.render();
    Desktop.config.init();
    this._addEventListeners();
    this._loadQueues();
  }

  _addEventListeners() {
    const sendBtn = this.shadowRoot.querySelector(".send-btn");
    sendBtn.addEventListener("click", () => this._handleSend());

    const searchInput = this.shadowRoot.querySelector(".search");
    const searchBtn = this.shadowRoot.querySelector(".search-btn");
    if (searchInput) {
      searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          this._handleSearch(searchInput.value.trim());
        }
      });
    }
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this._handleSearch(searchInput.value.trim()));
    }
  }

  async _loadQueues() {
    const select = this.shadowRoot.querySelector(".queue");
    const agentId = await getAgentIdByCiUserId(this.orgId, this.ciUserId, this.token, this.apiHost);
    const queues = agentId ? await getQueues(this.orgId, agentId, this.token, this.apiHost) : [];

    select.innerHTML = "";

    if (!queues.length) {
      const option = document.createElement("option");
      option.textContent = "No hay colas disponibles";
      option.disabled = true;
      select.appendChild(option);
      return;
    }

    queues.forEach(queue => {
      const option = document.createElement("option");
      option.value = queue.id;
      option.textContent = queue.name;
      select.appendChild(option);
    });
  }

  async _handleSend() {
    const phone    = this.shadowRoot.querySelector(".phone").value.trim();
    const queueId  = this.shadowRoot.querySelector(".queue").value;
    const status   = this.shadowRoot.querySelectorAll(".status");

    if (!phone) {
      notifications(status, "Introduce un número de teléfono.", "#fde8e8");
      return;
    }

    if (!queueId) {
      notifications(status, "Selecciona una cola.", "#fde8e8");
      return;
    }

    const raw = JSON.stringify({
      waid:    phone,
      email:   this.agentEmail,
      queueId: queueId
    });

    const result = await sendWebHook("POST", raw, this.WebHook);
    if (result && result.response[0]?.code === "1002") {
      notifications(status, "WhatsApp enviado correctamente.", "#befade");
    } else {
      notifications(status, "Error al enviar el WhatsApp.", "#fde8e8");
    }
  }

  async _handleSearch(query) {
    const status = this.shadowRoot.querySelectorAll(".status");

    if (!query) {
      return;
    }

    const results = await searchContacts(this.searchAPI, query, this.token);

    if (!results) {
      notifications(status, "No se ha podido completar la búsqueda.", "#fde8e8");
      return;
    }

    if (!results.length) {
      notifications(status, "No se encontraron resultados.", "#fde8e8");
      return;
    }

    this._showSearchResults(results);
  }

  _showSearchResults(results) {
    this._closeSearchPopup();

    const overlay = document.createElement("div");
    overlay.className = "search-popup-overlay";
    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        this._closeSearchPopup();
      }
    });

    const popup = document.createElement("div");
    popup.className = "search-popup";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "search-popup-close";
    closeBtn.textContent = "×";
    closeBtn.setAttribute("aria-label", "Cerrar");
    closeBtn.addEventListener("click", () => this._closeSearchPopup());
    popup.appendChild(closeBtn);

    const list = document.createElement("ul");
    list.className = "search-result-list";

    results.forEach(item => {
      const li = document.createElement("li");
      li.className = "search-result";

      const name = document.createElement("div");
      name.className = "search-result-name";
      name.textContent = item.name || "";
      li.appendChild(name);

      const phones = document.createElement("div");
      phones.className = "search-result-phones";

      (item.phones || []).forEach(phone => {
        const link = document.createElement("a");
        link.href = "#";
        link.className = "phone-link";
        link.textContent = phone;
        link.addEventListener("click", event => {
          event.preventDefault();
          this._selectPhone(phone);
        });
        phones.appendChild(link);
      });

      li.appendChild(phones);
      list.appendChild(li);
    });

    popup.appendChild(list);
    overlay.appendChild(popup);

    this.shadowRoot.querySelector(".wrapper").appendChild(overlay);
    this._searchPopupOverlay = overlay;
  }

  _closeSearchPopup() {
    if (this._searchPopupOverlay) {
      this._searchPopupOverlay.remove();
      this._searchPopupOverlay = null;
    }
  }

  _selectPhone(phone) {
    this.shadowRoot.querySelector(".phone").value = phone;
    this._closeSearchPopup();
  }

  async render() {
    this.shadowRoot.innerHTML = `
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

        .logo {
          display: block;
          max-width: 140px;
          max-height: 60px;
          object-fit: contain;
          margin: 0 auto 1.25rem;
        }

        label {
          display: block;
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
        }

        input[type="tel"],
        input[type="text"],
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
        input[type="text"]:focus,
        select:focus {
          border-color: #009cee;
        }

        .field {
          margin-bottom: 1.25rem;
        }

        .search-row {
          display: flex;
          gap: 8px;
        }

        .search-row .search {
          flex: 1;
          min-width: 0;
        }

        .search-btn {
          width: auto;
          flex-shrink: 0;
          padding: 10px 14px;
          font-size: 14px;
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

        .search-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .search-popup {
          position: relative;
          width: 640px;
          max-height: 70vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 10px;
          padding: 1.25rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .search-popup-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          padding: 0;
          line-height: 1;
          font-size: 18px;
          background: transparent;
          color: #666;
          border: none;
          border-radius: 50%;
          cursor: pointer;
        }

        .search-popup-close:hover {
          background: #f0f0f0;
        }

        .search-result-list {
          list-style: none;
          margin: 1.5rem 0 0;
          padding: 0;
        }

        .search-result {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .search-result:last-child {
          border-bottom: none;
        }

        .search-result-name {
          font-size: 13px;
          color: #333;
          margin-bottom: 6px;
        }

        .search-result-phones {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .phone-link {
          font-size: 13px;
          color: #009cee;
          text-decoration: none;
          cursor: pointer;
        }

        .phone-link:hover {
          text-decoration: underline;
        }
      </style>

      <div class="wrapper">
      <div class="container">
        <img src=${this.logo} class="logo" />

        ${this.searchAPI ? `
        <div class="field">
          <label for="search">Buscar contacto</label>
          <div class="search-row">
            <input type="text" class="search" placeholder="Buscar por nombre, correo, etc..." />
            <button type="button" class="search-btn">Buscar</button>
          </div>
        </div>
        ` : ""}

        <div class="field">
          <label for="phone">Número de teléfono</label>
          <input type="tel" class="phone" placeholder="34600000000" />
        </div>

        <div class="field">
          <label for="queue">Cola</label>
          <select class="queue"></select>
        </div>

        <div class="preview"></div>

        <button class="send-btn">Enviar WhatsApp</button>

        <div class="status"></div>
      </div>
      </div>
    `;
  }
}

customElements.define("sa-digital-whatsapp", SaDigitalWhatsApp);