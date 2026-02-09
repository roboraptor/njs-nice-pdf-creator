import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Registrace fontů
Font.register({
  family: 'SN Pro',
  fonts: [
    { src: '/fonts/SNPro-Regular.ttf' },
    { src: '/fonts/SNPro-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/SNPro-Regular.ttf', fontStyle: 'italic' },
  ],
});

const MyPdfDocument = ({ data, profile }) => {
  const s = profile?.styles || {};
  const global = s.global || {};
  const types = s.types || {};
  const h = global.header || {};

  // Pomocná funkce pro získání dynamického stylu z pravidel (Rules)
  const getDynamicStyle = (field, value, baseStyle) => {
    if (!field.rules) return baseStyle;
    const rule = field.rules.find(r => 
        String(value).toLowerCase() === String(r.matches).toLowerCase()
    );
    return rule ? { ...baseStyle, ...rule } : baseStyle;
  };

  // 1. Definice stylů
  const styles = StyleSheet.create({
    page: {
      padding: global.padding || 40,
      backgroundColor: global.backgroundColor || '#FFFFFF',
      fontFamily: global.fontFamily || 'SN Pro',
      color: '#222222',
    },
    headerWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: h.marginBottom || 20,
      paddingBottom: h.paddingBottom || 10,
      borderBottomWidth: h.borderBottomWidth || 0,
      borderBottomColor: h.borderBottomColor || 'transparent',
    },
    headerTitle: {
      fontSize: h.titleSize || 20,
      fontWeight: 'bold',
      color: profile?.styles?.types?.title?.color || '#000',
    },
    headerSubtitle: {
      fontSize: h.metaSize || 9,
      color: h.metaColor || '#666',
      marginTop: 2,
    },
    headerRight: {
      fontSize: h.metaSize || 9,
      color: h.metaColor || '#666',
      textAlign: 'right',
    },
    card: {
      marginBottom: 12, // Sníženo pro kompaktnější vzhled
      padding: 12,
      backgroundColor: '#F9FAFB',
      borderRadius: 4,
      borderLeft: global.cardBorderWidth || 0,
      borderLeftColor: global.cardBorderColor || 'transparent',
    },
    cardAnotation: {
      fontSize: h.cardAnotationSize || 7,
      color: h.cardAnotationColor || '#999',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    // Základní styly pro typy
    title: types.title || { fontSize: 18, fontWeight: 'bold' },
    subtitle: types.subtitle || { fontSize: 14, color: '#444' },
    body: types.body || { fontSize: 10 },
    meta: types.meta || { fontSize: 8, color: '#777' },

    // Generování dynamických stylů z profilu
    ...Object.keys(types).reduce((acc, key) => {
      acc[key] = {
        fontSize: types[key].fontSize || 10,
        color: types[key].color || '#000000',
        fontWeight: types[key].fontWeight || 'normal',
        marginBottom: types[key].marginBottom || 0,
      };
      return acc;
    }, {}),

    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      fontSize: 8,
      textAlign: 'center',
      color: '#9CA3AF',
      borderTop: 1,
      borderTopColor: '#EEEEEE',
      paddingTop: 10,
    }
  });

  return (
    <Document title={profile?.meta?.title || "Report"}>
      <Page size="A4" style={styles.page}>
        
        {/* HLAVIČKA DOKUMENTU */}
        <View style={styles.headerWrapper}>
          <View>
            <Text style={styles.headerTitle}>{profile?.meta?.title || "Report"}</Text>
            {profile?.meta?.project && (
              <Text style={styles.headerSubtitle}>Projekt: {profile.meta.project}</Text>
            )}
            {profile?.meta?.author && (
              <Text style={styles.headerSubtitle}>Autor: {profile.meta.author}</Text>
            )}
          </View>
          <View>
            <Text style={styles.headerRight}>
              {new Date().toLocaleDateString('cs-CZ')}
            </Text>
          </View>
        </View>

        {/* VÝPIS DAT (KARTY) */}
        {data.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.card} wrap={false}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
              {profile.schema.map((field) => {
                const value = row[field.id] || '';
                const fieldStyle = styles[field.type] || styles.body;
                
                // 1. Čištění a ořezávání textu
                const processedText = value ? (() => {
                  const cleaned = String(value)
                    .replace(/^\s*\*\s*$/gm, '') // Odstraní řádky kde je jen hvězdička
                    .replace(/\n\s*\n/g, '\n')   // Odstraní prázdné řádky
                    .trim();
                  
                  const lines = cleaned.split('\n');
                  if (lines.length > 20) {
                    return lines.slice(0, 20).join('\n') + '\n... (zkráceno)';
                  }
                  return cleaned;
                })() : '';

                // 2. Skládání linku pokud existuje šablona v JSONu
                const finalLink = field.link && value 
                  ? field.link.replace("${}", String(value)) 
                  : null;

                // 3. Dynamický styl (podmíněné formátování)
                const dynamicStyle = getDynamicStyle(field, value, fieldStyle);

                return (
                  <View 
                    key={field.id} 
                    style={{ 
                      width: field.width || '100%', 
                      marginBottom: 6,
                      paddingRight: 8,
                      // Vizuální limit výšky pouze pro pole typu 'body'
                      ...(field.type === 'body' && { maxHeight: 200, overflow: 'hidden' })
                    }}
                  >
                    {(field.type === 'meta' || field.type === 'body') && (
                      <Text style={styles.cardAnotation}>{field.label}</Text>
                    )}
                    
                    {finalLink ? (
                      <Link src={finalLink} style={{ textDecoration: 'none' }}>
                        <Text style={{ 
                          ...dynamicStyle, 
                          color: '#0052cc', 
                          textDecoration: 'underline' 
                        }}>
                          {processedText}
                        </Text>
                      </Link>
                    ) : (
                      <Text style={dynamicStyle}>
                        {processedText}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <Text 
          style={styles.footer} 
          render={({ pageNumber, totalPages }) => `Stránka ${pageNumber} z ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
};

export default MyPdfDocument;