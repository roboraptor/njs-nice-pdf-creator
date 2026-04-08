import React from 'react';
import dynamic from 'next/dynamic';
import MyPdfDocument from './MyPdfDocument';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

export default function PdfPreview({ data, profile, height = "600px", width = "100%" }) {
  if (!profile || !data || data.length === 0) {
    return null;
  }

  return (
    <div style={{ height, width }}>
      <PDFViewer width="100%" height="100%" style={{ borderRadius: '8px', border: 'none' }}>
        <MyPdfDocument data={data} profile={profile} />
      </PDFViewer>
    </div>
  );
}
