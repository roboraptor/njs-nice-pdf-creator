import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Registrace fontů (ponecháno beze změny)
Font.register({
  family: 'SN Pro',
  fonts: [
    { src: '/fonts/SNPro-Regular.ttf' },
    { src: '/fonts/SNPro-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/SNPro-Regular.ttf', fontStyle: 'italic' }, // Přidej cesty k ttf pokud máš i italiku
  ],
});

const MyPdfDocument = ({ data, profile }) => {
  const s = profile?.styles || {};
  const global = s.global || {};
  const types = s.types || {};
  const h = global.header || {};

  // 1. Dynamické generování stylů z JSONu
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
      marginBottom: 20,
      padding: 12,
      backgroundColor: '#F9FAFB', // Můžeš taky vytáhnout do JSONu
      borderRadius: 4,
      borderLeft: global.cardBorderWidth || 0,
      borderLeftColor: global.cardBorderColor || 'transparent',
    },
    cardAnotation: {
      fontSize: h.cardAnotationSize || 7,
      color: h.cardAnotationColor || '#999',
      textTransform: 'uppercase',
    },
    // Definice stylů pro jednotlivé typy polí
    title: types.title || { fontSize: 18, fontWeight: 'bold' },
    subtitle: types.subtitle || { fontSize: 14, color: '#444' },
    body: types.body || { fontSize: 10, marginTop: 5 },
    meta: types.meta || { fontSize: 8, color: '#777' },
 
    ...Object.keys(types).reduce((acc, key) => {
    acc[key] = {
        fontSize: types[key].fontSize || 10,
        color: types[key].color || '#000000',
        fontWeight: types[key].fontWeight || 'normal', // Přidáno pro BOLD
        marginBottom: types[key].marginBottom || 0,    // Přidáno pro MEZERY
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
        
        {/* Dynamická hlavička dokumentu */}
        <View style={styles.headerWrapper}>
          {/* Levá strana: Title, Project, Author */}
          <View>
            <Text style={styles.headerTitle}>{profile?.meta?.title || "Report"}</Text>
            {profile?.meta?.project && (
              <Text style={styles.headerSubtitle}>Projekt: {profile.meta.project}</Text>
            )}
            {profile?.meta?.author && (
              <Text style={styles.headerSubtitle}>Autor: {profile.meta.author}</Text>
            )}
          </View>

          {/* Pravá strana: Datum */}
          <View>
            <Text style={styles.headerRight}>
              {new Date().toLocaleDateString('cs-CZ')}
            </Text>
          </View>
        </View>

        {/* --- DYNAMICKÝ VÝPIS DAT --- */}
        {data.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.card} wrap={false}>
            {profile.schema.map((field) => {
              // Zjistíme, jestli máme pro tento typ pole definovaný styl
              // Pokud pole nemá typ, použijeme 'body'
              const fieldStyle = styles[field.type] || styles.body;
              
              return (
                <View key={field.id} style={{ marginBottom: 4 }}>
                  {/* Pokud je to meta nebo body, možná chceme zobrazit i Label */}
                  {(field.type === 'meta' || field.type === 'body') && (
                    <Text style={styles.cardAnotation}>
                      {field.label}
                    </Text>
                  )}
                  
                  {/* Samotná hodnota z CSV */}
                  <Text style={fieldStyle}>
                    {row[field.id] || ''}
                  </Text>
                </View>
              );
            })}
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