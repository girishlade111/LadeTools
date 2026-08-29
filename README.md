# 🧰 LadeTools

**LadeTools** is a modern, blazing-fast, client-side-only developer toolbox.

No backend, no accounts, and zero cloud roundtrips. All computations execute locally inside your browser, and all user data and tool history persist locally via **IndexedDB** using Dexie.

---

## ✨ Features

- **🔒 100% Client-Side & Private**: Your data and tokens never leave your browser.
- **💾 Offline Persistence**: Local history, settings, and scratchpad saved via IndexedDB (`dexie`).
- **⚡ Blazing Fast**: Built with React 18, Vite, and TypeScript.
- **🎨 Modern Aesthetic**: Tailwind CSS with dark/light mode HSL design tokens and shadcn/ui components.
- **🧩 Modular Architecture**: Easily extensible multi-tool structure.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Local Database**: [Dexie.js](https://dexie.org/) & `dexie-react-hooks`
- **Linting & Formatting**: [ESLint 9](https://eslint.org/) + [Prettier](https://prettier.io/)

---

## 📁 Project Structure

```
src/
├── components/          # Reusable shared components
│   ├── tools/          # Multi-tool modules & registries
│   └── ui/             # shadcn/ui design primitives (Button, etc.)
├── db/                 # Dexie IndexedDB client and store schemas
├── hooks/              # Custom React hooks (useTheme, etc.)
├── lib/                # Utilities (cn helper, formatters)
├── pages/              # SPA layout and page views
├── App.tsx             # Root application view
├── index.css           # Design tokens & Tailwind entry
└── main.tsx            # React DOM mounting
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ (tested on Node 26)
- **npm**: v9+

### Installation

```bash
# Clone the repository
git clone git@github.com:girishlade111/LadeTools.git
cd LadeTools

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build & Type Check

```bash
npm run build
```

### Lint & Format

```bash
npm run lint
npm run format
```

---

## 📄 License

MIT License.
