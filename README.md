# 📄 NicePDFCreator

**Moderní generátor PDF reportů z CSV dat pro Jira a vývojové týmy.** Tento projekt umožňuje uživatelům nahrát CSV export (např. z Jiry), definovat vizuální styl a mapování polí pomocí grafického editoru a následně vygenerovat čisté, profesionální PDF dokumenty.

---

## 🚀 Hlavní Funkce

* **Dynamické Mapování:** Nahrajte libovolné CSV a přiřaďte sloupce k polím v PDF (Title, Body, Meta).
* **Editor Profilů:** Kompletní vizuální editor pro nastavení barev, velikosti písma, tloušťky linek a rozvržení hlavičky.
* **Real-time Preview:** Okamžité generování PDF dokumentů na straně klienta.
* **Custom Design:** Podpora vlastních fontů (SN Pro) a moderního tmavého UI.
* **Persistentní Nastavení:** Export a import konfiguračních profilů ve formátu JSON.

## 🛠️ Technologie

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **PDF Engine:** [@react-pdf/renderer](https://react-pdf.org/)
- **UI:** [React Bootstrap](https://react-bootstrap.github.io/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Data Parsing:** [PapaParse](https://www.papaparse.com/)

---

## 📂 Struktura Projektu

```text
├── components/
│   ├── Layout.js           # Společný obal aplikace (Navbar, Footer)
│   └── MyPdfDocument.js    # Definice PDF šablony a stylů
├── pages/
│   ├── _app.js             # Globální nastavení a import CSS
│   ├── index.js            # Hlavní generátor PDF
│   └── mapping.js          # Editor profilu a mapování dat
├── public/
│   ├── data/               # VSTUPNÍ DATA (JSON profily a CSV data)
│   └── fonts/              # TTF fonty pro PDF
└── styles/
    └── theme.css           # Custom Dark Mode styling
```

## 🏁 Jak začít
1. Instalace

Nejprve nainstalujte potřebné balíčky:
Bash

```text
npm install
# nebo
yarn install
```

2. Spuštění vývojového serveru
Bash

```text
npm run dev
```

Aplikace bude dostupná na http://localhost:3000.

3. Použití

    Přejděte do Editoru Profilu (/mapping).

    Nahrajte vzorové CSV pro načtení hlaviček.

    Upravte barvy, fonty a mapování polí.

    Uložte profil (stáhne se jako JSON).

    Na hlavní stránce nahrajte CSV s daty + váš uložený profil a klikněte na Stáhnout PDF.

## 📋 Příklad JSON Profilu

```JSON
{
  "meta": {
    "title": "Jira Report",
    "project": "L2 Support"
  },
  "schema": [
    { "id": "Summary", "label": "Téma", "type": "title" },
    { "id": "Status", "label": "Stav", "type": "meta" }
  ],
  "styles": {
    "types": {
      "title": { "fontSize": 18, "color": "#0052CC", "fontWeight": "bold" }
    }
  }
}
```

## 🤝 Přispívání

Projekt je otevřený pro jakákoliv vylepšení. Stačí vytvořit Pull Request nebo nahlásit Issue.

Vytvořeno s ❤️ pro efektivnější reportování.


