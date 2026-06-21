# WhatsApp Widget for Webex Contact Center

A custom widget for **Webex Contact Center Desktop** that allows agents and supervisors to send WhatsApp templates directly from the agent desktop.

---

## Description

This widget integrates into the Webex Contact Center Desktop Layout and provides a simple UI for agents to send WhatsApp message templates via a configured webhook. It is built as a Web Component using Node.js and bundled into a single JavaScript file served via GitHub Pages.

---

## Features

- Send WhatsApp templates from the Webex Contact Center agent/supervisor desktop
- Queue selector: the widget queries the agent's assigned queues via the Webex CC API and lets the agent pick which one to send in the request
- Dark mode support (synced with the desktop's theme setting)
- Configurable logo
- Token-based authentication using the agent's access token

---

## Installation & Build

### Prerequisites

- Node.js
- npm

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/esanval/whatsapp-widget.git
   cd whatsapp-widget
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the bundle:

   ```bash
   npm run build
   ```

   This will generate/update the bundle file at:

   ```
   src/build/digital-whatsapp-bundle.js
   ```

> **Important:** After any code modification, you must run `npm run build` to regenerate the bundle. The desktop layout must point to the updated bundle file.

---

## Desktop Layout Configuration

To add the widget to the Webex Contact Center Desktop, edit your **Desktop Layout JSON** and add the following block inside the `agent` and/or `supervisor` section, under `area > navigation`:

```json
{
  "nav": {
    "label": "Send Whatsapp",
    "icon": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    "iconType": "other",
    "navigateTo": "send-whatsapp",
    "align": "top"
  },
  "page": {
    "id": "send-whatsapp",
    "widgets": {
      "main": {
        "comp": "div",
        "style": {
          "height": "100%",
          "overflow": "scroll"
        },
        "children": [
          {
            "comp": "sa-digital-whatsapp",
            "script": "https://esanval.github.io/whatsapp-widget/src/build/digital-whatsapp-bundle.js",
            "attributes": {
              "darkmode": "$STORE.app.darkMode"
            },
            "properties": {
              "token": "$STORE.auth.accessToken",
              "agentEmail": "$STORE.agent.agentEmailId",
              "logo": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
              "WebHook": "https://hooks.uk.webexconnect.io/events/SQXQPAVAFI",
              "user-id": "$STORE.agent.agentId",
              "org-id": "$STORE.agent.orgId",
              "apiHost": "api.wxcc-eu2.cisco.com",
              "searchAPI": "https://your-api.example.com/contacts?q="
            }
          }
        ]
      }
    },
    "layout": {
      "areas": [["main"]],
      "size": {
        "cols": [1],
        "rows": [1]
      }
    }
  }
}
```

---

## Queue Selection & Webhook Payload

When the widget loads, `$STORE.agent.agentId` (passed as the `user-id` property) is actually the agent's **CI user id**, not the id expected by the agent-based-queues API. So the widget first resolves the real agent id:

```
GET https://<apiHost>/organization/<org-id>/v2/user/by-ci-user-id/<user-id>
Authorization: Bearer <token>
```

The `id` field of that response is the agent id used to fetch the queues assigned to the logged-in agent:

```
GET https://<apiHost>/organization/<org-id>/v2/contact-service-queue/by-user-id/<agent-id>/agent-based-queues
Authorization: Bearer <token>
```

`apiHost` defaults to `api.wxcc-eu2.cisco.com` and can be overridden via the `apiHost` property (e.g. to point to another Webex CC region).

The returned queues are shown in a dropdown so the agent can pick which one the request should be routed to. The selected queue's `id` is sent as `queueId` in the webhook request body, along with the existing fields:

```json
{
  "waid": "34600000000",
  "email": "agent@example.com",
  "queueId": "497d62a2-17b8-4a71-8e40-667b4290b0b1"
}
```

> The `org-id` and `user-id` properties must be set in the Desktop Layout (see above) for the queue lookup to work.

---

## Contact Search

If the `searchAPI` property is set in the Desktop Layout, a search field is shown above the phone field. Typing a query and pressing **Enter** issues:

```
GET <searchAPI><URL-encoded query>
Authorization: Bearer <token>
```

The search endpoint is expected to respond with:

```json
{
  "data": [
    {
      "name": "Jane Doe / ACME CORP, S.L.",
      "phones": ["600000001"]
    },
    {
      "name": "John Smith / EXAMPLE LTD",
      "phones": ["600000002", "600000003"]
    }
  ]
}
```

A popup then lists every result with its phone numbers as clickable links. Clicking a phone number fills the `phone` field with that number and closes the popup. The popup can also be closed by clicking outside it or via its close button. If the request fails or returns no data, a status message is shown instead.

If `searchAPI` is not set, the search field is not rendered.

---

## 🔧 Configurable Properties

| Property | Description | Configurable |
|----------|-------------|:---:|
| `logo` | URL of the logo image displayed inside the widget | ✅ Yes |
| `token` | Agent access token (auto-injected from the desktop store). Also used to authenticate the call to the Webex CC queues API | ❌ No |
| `agentEmail` | Email address of the agent | ❌ No |
| `WebHook` | Webex Connect webhook URL that receives the template send request | ✅ Yes* |
| `user-id` | Agent's CI user ID (auto-injected from the desktop store), used to resolve the real agent ID before looking up the agent's queues | ❌ No |
| `org-id` | Webex CC organization ID (auto-injected from the desktop store), used to look up the agent's queues | ❌ No |
| `apiHost` | Host of the Webex CC API used for the queue lookup. Defaults to `api.wxcc-eu2.cisco.com` | ✅ Yes |
| `searchAPI` | Base URL of the contact search API. When set, shows the contact search field. The URL-encoded search text is appended to this string for the GET request. When unset, the search field is hidden | ✅ Yes |
| `darkmode` | Dark mode toggle (auto-synced with desktop theme) | ❌ No |
| `script` | URL pointing to the widget bundle file | ✅ If rehosted |

> \* The `WebHook` property is set by the administrator in the layout and is not meant to be changed by agents.

### Changing the logo

To use a custom logo, replace the `logo` property value with any publicly accessible image URL:

```json
"logo": "https://your-domain.com/your-logo.png"
```

### Rehosting the bundle

If you fork this repository or host the bundle on a different server, update the `script` field in the layout to point to the new URL:

```json
"script": "https://your-domain.com/path/to/digital-whatsapp-bundle.js"
```

---

## 📁 Project Structure

```
whatsapp-widget/
├── src/
│   ├── build/
│   │   └── digital-whatsapp-bundle.js   # Compiled bundle (served via GitHub Pages)
│   └── ...                              # Source files
├── package.json
└── README.md
```

---

## Hosting

The widget bundle is served via **GitHub Pages** at:

```
https://esanval.github.io/whatsapp-widget/src/build/digital-whatsapp-bundle.js
```

Any changes pushed to the repository that affect the bundle file will be automatically reflected once GitHub Pages updates.

---

## License

This project is licensed under the [MIT License](LICENSE).
