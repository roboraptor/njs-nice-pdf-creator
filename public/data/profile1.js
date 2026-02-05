// Nastavení vzhledu a mapování pro Jira Report
export const profile = {
  meta: {
    title: "Jira Souhrnný Report",
    author: "Automatický Generátor",
    logoText: "JIRA REPORT", // Místo obrázku zatím použijeme text
  },
  styles: {
    primaryColor: "#0052CC", // Klasická Jira modrá
    secondaryColor: "#FF5630", // Jira červená (pro chyby)
    backgroundColor: "#F4F5F7",
    textColor: "#172B4D",
    headerFontColor: "#FFFFFF",
    fontSize: 10,
  },
  // Překlady hlaviček (aby v PDF bylo "Zpracovatel" místo "Assignee")
  labels: {
    TicketID: "ID Tiketu",
    Summary: "Předmět",
    Description: "Popis problému",
    Solution: "Řešení",
    KnownErrors: "Známé chyby",
    Assignee: "Zpracovatel",
    Status: "Stav",
    Date: "Datum"
  }
};