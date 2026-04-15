# WhatsApp Widget for Webex Contact Center

A custom widget for **Webex Contact Center Desktop** that allows agents and supervisors to send WhatsApp templates directly from the agent desktop.

---

## Description

This widget integrates into the Webex Contact Center Desktop Layout and provides a simple UI for agents to send WhatsApp message templates via a configured webhook. It is built as a Web Component using Node.js and bundled into a single JavaScript file served via GitHub Pages.

---

## Features

- Send WhatsApp templates from the Webex Contact Center agent/supervisor desktop
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
              "logo": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
              "WebHook": "https://hooks.uk.webexconnect.io/events/SQXQPAVAFI"
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

## 🔧 Configurable Properties

| Property | Description | Configurable |
|----------|-------------|:---:|
| `logo` | URL of the logo image displayed inside the widget | ✅ Yes |
| `token` | Agent access token (auto-injected from the desktop store) | ❌ No |
| `WebHook` | Webex Connect webhook URL that receives the template send request | ✅ Yes* |
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
