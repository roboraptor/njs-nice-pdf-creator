// utils/dataProcessor.js

/**
 * Centrální pipeline pro zpracování dat
 * 1. Vyčištění prázdných řádků
 * 2. Aplikace RegExů
 * 3. Aplikace Rules (Barvy, Hide, atd.)
 */
export const processPdfData = (rawData, profile) => {
  if (!rawData || rawData.length === 0 || !profile) return [];

 
    // --- KROK 1: Vyčištění a Filtrování komentářů ---
    let processed = rawData.filter(row => {
    // 1. Kontrola, zda řádek není úplně prázdný
    const hasValues = Object.values(row).some(val => val !== null && val !== undefined && val !== "");
    if (!hasValues) return false;

    // 2. Kontrola na komentáře // (v jakémkoliv sloupci)
    const isComment = Object.values(row).some(val => 
        String(val).trim().startsWith('//')
    );
    
    return !isComment;
    });

// --- KROK 1.1: Globální sanitace (Odstranění komentářů // ze všech polí) ---
  processed = processed.map(row => {
    const sanitizedRow = { ...row };
    Object.keys(sanitizedRow).forEach(key => {
      if (typeof sanitizedRow[key] === 'string') {
        sanitizedRow[key] = sanitizedRow[key]
          .split('\n')
          .filter(line => !line.trim().startsWith('//'))
          .join('\n')
          .trim();
      }
    });
    return sanitizedRow;
  });

  // --- KROK 2: RegEx extrakce ---
  processed = processed.map(row => {
    const newRow = { ...row };
    profile.schema.forEach(field => {
      if (field.regex && field.sourceField) {
        const textToSearch = String(row[field.sourceField] || "");
        try {
          const regex = new RegExp(field.regex, "m");
          const match = textToSearch.match(regex);
          if (match) {
            newRow[field.id] = match[1] ? match[1].trim() : match[0].trim();
          } else {
            newRow[field.id] = ""; 
          }
        } catch (e) {
          newRow[field.id] = "Regex Error";
        }
      }
    });
    return newRow;
  });

  // --- KROK 3: Rules & Filtering (HIDE LOGIC) ---
  processed = processed.filter(row => {
    let shouldHideRow = false;

    profile.schema.forEach(field => {
      if (field.rules) {
        field.rules.forEach(rule => {
          const cellValue = String(row[field.id] || "");
          
          if (cellValue === rule.matches) {
            // Logika pro skrytí celého řádku
            if (rule.hide === true) {
              shouldHideRow = true;
            }
            
            // Logika pro barvy/styly (ukládáme přímo do řádku pro MyPdfDocument)
            row[`_style_${field.id}`] = {
              color: rule.color,
              fontWeight: rule.fontWeight
            };
          }
        });
      }
    });

    return !shouldHideRow;
  });

  return processed;
};