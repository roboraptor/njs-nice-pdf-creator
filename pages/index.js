import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Badge, Nav, Navbar } from 'react-bootstrap';
import { FiCheckCircle, FiFileText, FiSettings, FiDownload, FiPlay, FiHome, FiMap, FiFolder } from 'react-icons/fi';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { PDFDownloadLink} from '@react-pdf/renderer';
import MyPdfDocument from '../components/MyPdfDocument';
import dynamic from 'next/dynamic';
// Importujeme tvou novou logiku
import { processPdfData } from '../utils/dataProcessor';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

const AUTOLOAD_DEFAULTS = false;

export default function Home() {
  const [csvData, setCsvData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [csvFileName, setCsvFileName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // --- KLÍČOVÝ BOD: Zpracování dat ---
  // Tato proměnná vezme csvData a profile a vrátí vyčištěná data s aplikovanými regexy a filtry.
  const processedData = processPdfData(csvData, profile);

  useEffect(() => {
    if (!AUTOLOAD_DEFAULTS) {
      setLoadingDefaults(false);
      return; 
    }
    const loadDefaultData = async () => {
      try {
        const profileRes = await fetch('/data/profile1.json');
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setProfile(profileJson);
          setProfileName("profile1.json (výchozí)");
        }
        const csvRes = await fetch('/data/data.csv');
        if (csvRes.ok) {
          const csvText = await csvRes.text();
          setCsvFileName("data.csv (výchozí)");
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => setCsvData(results.data),
          });
        }
      } catch (err) {
        console.error("Chyba při auto-loadu:", err);
      } finally {
        setLoadingDefaults(false);
      }
    };
    loadDefaultData();
  }, []);

  const handleExcelOrCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    setCsvFileName(file.name); // Nastavíme název souboru pro UI

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length > 0) {
          // OPRAVENO: Odstraněno volání setCsvHeaders
          setCsvData(jsonData); 
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // OPRAVENO: Odstraněno volání setCsvHeaders
          setCsvData(results.data); 
        }
      });
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          setProfile(JSON.parse(event.target.result));
          setError(null);
        } catch (err) { setError("Neplatný profil."); }
      };
      reader.readAsText(file);
    }
  };

  const isReady = profile !== null && processedData.length > 0;

  return (
    <div className="main-wrapper">
      <Head>
        <title>NicePDFCreator</title>
      </Head>

      <Container>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Row className="g-4 mb-4">
          <Col md={7}>
            <Card className="config-card h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="section-title"><FiFolder /> Vstupní soubory</Card.Title>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="field-label">PROFIL (JSON)</Form.Label>
                      <Form.Control type="file" accept=".json" onChange={handleProfileUpload} />
                      {profile && <div className="status-success small mt-1"><FiCheckCircle /> Načteno {profileName}</div>}
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="field-label">DATA (CSV/XLSX)</Form.Label>
                      <Form.Control type="file" size="sm" accept=".csv, .xlsx, .xls" onChange={handleExcelOrCsvUpload} />
                      {csvData.length > 0 && <div className="status-success small mt-1"><FiCheckCircle /> {csvData.length} řádků v {csvFileName}</div>}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="config-card h-100 shadow-sm border-primary">
              <Card.Body className="d-flex flex-column justify-content-center">
                <Card.Title className="section-title"><FiPlay /> Akce</Card.Title>
                <div className="d-grid gap-2">
                  {isReady ? (
                    <PDFDownloadLink 
                      document={<MyPdfDocument data={processedData} profile={profile} />} 
                      fileName="jira_report.pdf"
                      style={{ textDecoration: 'none' }}
                    >
                      {({ loading }) => (
                        <Button className="btn-generate w-100 py-3 fw-bold" disabled={loading}>
                          {loading ? 'Generuji...' : <><FiDownload className="me-2" /> Vygenerovat PDF Report</>}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <Button variant="secondary" className="py-3" disabled>
                      {loadingDefaults ? 'Načítám výchozí...' : 'Čekám na data a profil'}
                    </Button>
                  )}

                <Button 
                      variant="outline-info" 
                      disabled={!isReady}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <FiPlay className="me-2" /> {showPreview ? 'Zavřít náhled' : 'Zobrazit náhled'}
                    </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
            {showPreview && isReady && (
              <Card className="mt-3 border-0 shadow-lg">
                <Card.Body className="p-0" style={{ height: '600px' }}>
                  <PDFViewer width="100%" height="100%" style={{ borderRadius: '8px', border: 'none' }}>
                    <MyPdfDocument data={processedData} profile={profile} />
                  </PDFViewer>
                </Card.Body>
              </Card>
            )}
        </Row>

        <Row>
          <Col>
            <Card className="preview-card shadow-sm">
              <Card.Header className="preview-header p-3 d-flex justify-content-between align-items-center bg-transparent">
                <span className="section-title mb-0"><FiFileText /> Náhled dat po aplikaci logiky</span>
                <Badge bg="dark" className="status-badge">{processedData.length} zobrazených řádků</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {processedData.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="custom-table mb-0">
                      <thead>
                        <tr>
                          {/* Generujeme hlavičky z prvního zpracovaného řádku */}
                          {Object.keys(processedData[0])
                            .filter(key => !key.startsWith('_style_')) // Skryjeme pomocná stylovací pole
                            .map(key => <th key={key}>{key}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {processedData.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            {Object.entries(row)
                              .filter(([key]) => !key.startsWith('_style_'))
                              .map(([key, val], j) => <td key={j}>{String(val)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-5 text-center text-muted">
                    Zatím nejsou k dispozici žádná data pro náhled nebo byla všechna odfiltrována.
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}