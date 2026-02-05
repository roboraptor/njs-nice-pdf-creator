import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// 1. Registrace fontů s podporou češtiny
Font.register({
  family: 'SN Pro',
  fonts: [
    { src: '/fonts/SNPro-Regular.ttf' },
    { src: '/fonts/SNPro-Bold.ttf', fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const MyPdfDocument = ({ data, profile }) => {
  // 2. Definice stylů - přepnuto na SN Pro
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: '#FFFFFF',
      fontFamily: 'SN Pro', // Aplikujeme registrovaný font
      color: '#222222',
    },
    header: {
      marginBottom: 25,
      borderBottom: 2,
      borderBottomColor: profile?.styles?.primaryColor || '#0052CC',
      paddingBottom: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    title: {
      fontSize: 22,
      color: profile?.styles?.primaryColor || '#0052CC',
      fontWeight: 'bold',
      letterSpacing: -0.5,
    },
    metaInfo: {
      fontSize: 9,
      color: '#777777',
      textAlign: 'right',
    },
    ticketContainer: {
      marginBottom: 20,
      padding: 12,
      backgroundColor: '#F9FAFB',
      borderRadius: 4,
      borderLeft: 3,
      borderLeftColor: profile?.styles?.primaryColor || '#0052CC',
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      borderBottom: 1,
      borderBottomColor: '#EEEEEE',
      paddingBottom: 4,
    },
    ticketId: {
      fontSize: 11,
      fontWeight: 'bold',
      color: profile?.styles?.secondaryColor || '#FF5630',
    },
    status: {
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#555555',
    },
    summary: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#111111',
    },
    section: {
      marginBottom: 6,
    },
    label: {
      fontSize: 8,
      color: '#6B7280',
      textTransform: 'uppercase',
      marginBottom: 2,
      fontWeight: 'bold',
    },
    value: {
      fontSize: 10,
      lineHeight: 1.4,
    },
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
    <Document title={profile?.meta?.title || "Jira Report"}>
      <Page size="A4" style={styles.page}>
        {/* Hlavička dokumentu */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{profile?.meta?.title || "Export Reportu"}</Text>
          </View>
          <View>
            <Text style={styles.metaInfo}>Projekt: {profile?.meta?.project || "Nezadáno"}</Text>
            <Text style={styles.metaInfo}>
              Datum: {new Date().toLocaleDateString('cs-CZ')}
            </Text>
          </View>
        </View>

        {/* Výpis tiketů */}
        {data.map((ticket, index) => (
          <View key={index} style={styles.ticketContainer} wrap={false}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketId}>{ticket.TicketID}</Text>
              <Text style={styles.status}>{ticket.Status} • {ticket.Date}</Text>
            </View>
            
            <Text style={styles.summary}>{ticket.Summary}</Text>
            
            <View style={styles.section}>
              <Text style={styles.label}>{profile?.labels?.Description || 'Popis'}</Text>
              <Text style={styles.value}>{ticket.Description || '-'}</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.label}>{profile?.labels?.Solution || 'Řešení'}</Text>
              <Text style={styles.value}>{ticket.Solution || '-'}</Text>
            </View>

            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 9, color: '#444' }}>
                <Text style={{ fontWeight: 'bold' }}>{profile?.labels?.Assignee || 'Řešitel'}: </Text>
                {ticket.Assignee}
              </Text>
            </View>
          </View>
        ))}

        {/* Číslování stránek v patičce */}
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