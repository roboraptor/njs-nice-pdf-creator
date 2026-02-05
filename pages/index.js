import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Badge, Navbar } from 'react-bootstrap';
import { FiCheckCircle, FiFileText, FiSettings, FiDownload, FiPlay } from 'react-icons/fi';
import Papa from 'papaparse';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyPdfDocument from '../components/MyPdfDocument';

export default function Home() {
  const [csvData, setCsvData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loadingDefaults, setLoadingDefaults] = useState(true);

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const profileRes = await fetch('/data/profile1.json');
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setProfile(profileJson);
        }
        const csvRes = await fetch('/data/data.csv');
        if (csvRes.ok) {
          const csvText = await csvRes.text();
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

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => { setCsvData(results.data); setError(null); },
        error: (err) => setError("Chyba CSV: " + err.message)
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

  const isReady = profile !== null && csvData.length > 0;

  return (
    <div className="main-wrapper">
      <Head>
        <title>NicePDFCreator</title>
      </Head>

      <Navbar className="custom-navbar mb-4">
        <Container>
          <Navbar.Brand className="brand-text">
            Nice<span>PDF</span>Creator
          </Navbar.Brand>
          <Badge bg="primary">v1.0</Badge>
        </Container>
      </Navbar>

      <Container>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        {/* HORNÍ SEKCE: 2 SLOUPCE (Vstupy a Tlačítka) */}
        <Row className="g-4 mb-4">
          <Col md={7}>
            <Card className="config-card h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="section-title"><FiSettings /> Vstupní soubory</Card.Title>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="field-label">PROFIL (JSON)</Form.Label>
                      <Form.Control type="file" accept=".json" onChange={handleProfileUpload} />
                      {profile && <div className="status-success small mt-1"><FiCheckCircle /> Načteno</div>}
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="field-label">DATA (CSV)</Form.Label>
                      <Form.Control type="file" accept=".csv" onChange={handleCsvUpload} />
                      {csvData.length > 0 && <div className="status-success small mt-1"><FiCheckCircle /> {csvData.length} řádků</div>}
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
                      document={<MyPdfDocument data={csvData} profile={profile} />} 
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
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* DOLNÍ SEKCE: NÁHLED (Full width) */}
        <Row>
          <Col>
            <Card className="preview-card shadow-sm">
              <Card.Header className="preview-header p-3 d-flex justify-content-between align-items-center bg-transparent">
                <span className="section-title mb-0"><FiFileText /> Náhled dat pro PDF</span>
                <Badge bg="dark" className="status-badge">{csvData.length} záznamů</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {csvData.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="custom-table mb-0">
                      <thead>
                        <tr>
                          {Object.keys(csvData[0]).map(key => <th key={key}>{key}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-5 text-center text-muted">
                    Zatím nejsou k dispozici žádná data pro náhled.
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