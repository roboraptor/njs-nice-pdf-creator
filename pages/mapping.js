import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import { FiSave, FiSettings, FiType, FiCheckCircle, FiFolder, FiFileText, FiPlay, FiLayout } from 'react-icons/fi';
import Head from 'next/head';
import { processPdfData } from '../utils/dataProcessor';
import { parseDataFile, parseJsonFile, downloadJsonFile } from '../utils/fileHandlers';
import PdfPreview from '../components/PdfPreview';

export default function MappingPage() {
  const [profile, setProfile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [activeTab, setActiveTab] = useState('meta');
  const [csvData, setCsvData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    fetch('/data/profile1.json')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error("Chyba při načítání profilu:", err));
  }, []);

  useEffect(() => {
    if (profile) {
      setJsonText(JSON.stringify(profile, null, 2));
    }
  }, [profile]);

  // --- OBSLUHA SOUBORŮ ---

  const handleExcelOrCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { data, headers } = await parseDataFile(file);
      if (data.length > 0) {
        setCsvHeaders(headers);
        setCsvData(data);
      }
    } catch (err) {
      console.error("Chyba při čtení dat:", err);
    }
  };

  // --- POMOCNÉ FUNKCE PRO EDITOR ---

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseJsonFile(file);
      setProfile(parsed);
    } catch (err) {
      alert("Chyba v JSONu");
    }
  };

  const updateProfile = (path, value) => {
    const newProfile = { ...profile };
    const keys = path.split('.');
    let current = newProfile;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setProfile(newProfile);
  };

  const handleJsonChange = (val) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setProfile(parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError("Neplatný formát JSON: " + e.message);
    }
  };

  const saveProfile = () => {
    downloadJsonFile(profile, `${profile.meta.title || 'profile'}_updated.json`);
  };

  const generateSchemaFromCsv = () => {
    if (csvHeaders.length === 0) return;
    const newSchema = csvHeaders.map(header => ({
        id: header,
        label: header,
        type: "body"
    }));
    setProfile({ ...profile, schema: newSchema });
  };

  const addNewField = () => {
    const newField = { id: `new_${Date.now()}`, label: "Nové pole", type: "body" };
    setProfile({ ...profile, schema: [...profile.schema, newField] });
  };

  const removeField = (index) => {
    const newSchema = [...profile.schema];
    newSchema.splice(index, 1);
    setProfile({ ...profile, schema: newSchema });
  };

  if (!profile) return <Container className="py-5 text-center">Načítání konfigurace...</Container>;

  // Ponecháno renderování (return) podle původního zadání
  return (
    <div className="main-wrapper">
      <Head>
        <title>Editor Profilu | NicePDFCreator</title>
      </Head>
      
      <Container className="py-4">
        <Row className="g-4">
          <Col lg={4}>
            <Card className="config-card mb-4 shadow-sm">
              <Card.Body>
                <Card.Title className="section-title"><FiFolder /> Vstupní soubory</Card.Title>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Aktuální Profil (JSON)</Form.Label>
                  <Form.Control type="file" size="sm" accept=".json" onChange={handleProfileUpload} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small fw-bold">Vzorové CSV (pro mapování a náhled)</Form.Label>
                  <Form.Control type="file" size="sm" accept=".csv, .xlsx, .xls" onChange={handleExcelOrCsvUpload} />
                </Form.Group>
                <hr className="my-4 border-secondary opacity-25" />
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Právě editujete:</Form.Label>
                <div className="status-info p-3 rounded bg-dark border border-secondary text-light small">
                    <FiCheckCircle className="text-success me-2" /><strong>{profile.meta.title}</strong>
                </div>
                </Form.Group>
                <Form.Group className="d-grid gap-2">
                <Button
                  variant="outline-info" 
                  disabled={csvData.length === 0 || !profile}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <FiPlay className="me-2" /> {showPreview ? 'Zavřít náhled' : 'Zobrazit náhled'}
                </Button>
                <Button className="btn-generate px-4" onClick={saveProfile}>
                  <FiSave className="me-2" /> Uložit JSON Profil
                </Button>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="config-card shadow-sm border-0">
              <Card.Body>
              <Card.Title className="section-title"><FiSettings /> Konfigurace Profilu</Card.Title>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-tabs mb-4">
                  
                  <Tab eventKey="meta" title={<span><FiType className="me-1" /> Info & Hlavička</span>}>
                        <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Label className="field-label text-muted small">Název</Form.Label>
                            <Form.Control 
                            placeholder="Např. Report"
                            value={profile.meta.title} 
                            onChange={(e) => updateProfile('meta.title', e.target.value)} 
                            />
                        </Col>
                        <Col md={2}></Col>
                        <Col md={2}>
                            <Form.Label className="field-label text-muted small">Barva názvu</Form.Label>
                            <Form.Control 
                            type="color" 
                            value={profile.styles.types.title.color || '#000000'} 
                            onChange={(e) => updateProfile('styles.types.title.color', e.target.value)} 
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label className="field-label text-muted small">Velikost názvu</Form.Label>
                            <Form.Control 
                            type="number" 
                            value={profile.styles.global.header.titleSize} 
                            onChange={(e) => updateProfile('styles.global.header.titleSize', parseInt(e.target.value))} 
                            />
                        </Col>
                        </Row>

                        <hr className="my-4 border-secondary opacity-25" />

                        <Row className="g-3">
                        <Col md={4}>
                            <Form.Label className="field-label text-muted small">Projekt</Form.Label>
                            <Form.Control 
                            placeholder="Název projektu..."
                            value={profile.meta.project || ''} 
                            onChange={(e) => updateProfile('meta.project', e.target.value)} 
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="field-label text-muted small">Autor</Form.Label>
                            <Form.Control 
                            placeholder="Jméno autora..."
                            value={profile.meta.author || ''} 
                            onChange={(e) => updateProfile('meta.author', e.target.value)} 
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label className="field-label text-muted small">Barva meta</Form.Label>
                            <Form.Control 
                            type="color" 
                            value={profile.styles.global.header.metaColor || '#666666'} 
                            onChange={(e) => updateProfile('styles.global.header.metaColor', e.target.value)} 
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label className="field-label text-muted small">Velikost meta</Form.Label>
                            <Form.Control 
                            type="number" 
                            value={profile.styles.global.header.metaSize || 9} 
                            onChange={(e) => updateProfile('styles.global.header.metaSize', parseInt(e.target.value))} 
                            />
                        </Col>
                        </Row>
                  </Tab>

                  <Tab eventKey="schema" title={<span><FiLayout className="me-1" /> Mapování polí</span>}>
                    <div className="d-flex justify-content-between mb-3">
                        <div className="gap-2 d-flex">
                        <Button variant="outline-primary" size="sm" onClick={addNewField}>
                            + Přidat pole ručně
                        </Button>
                        <Button variant="outline-success" size="sm" onClick={generateSchemaFromCsv} disabled={csvHeaders.length === 0}>
                            🪄 Generovat schéma z CSV
                        </Button>
                        </div>
                        <Badge bg="secondary">Počet polí: {profile.schema.length}</Badge>
                    </div>

                    <Table borderless responsive className="custom-table align-middle">
                      <thead>
                        <tr className="text-muted small uppercase">
                          <th>Pole v PDF</th>
                          <th>Typ (Styl)</th>
                          <th>Sloupec v CSV</th>
                          <th>Akce</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.schema.map((field, idx) => (
                          <tr key={field.id} className="border-bottom border-secondary">
                            <td>
                              <Form.Control size="sm" value={field.label} 
                                onChange={(e) => {
                                  const newSchema = [...profile.schema];
                                  newSchema[idx].label = e.target.value;
                                  setProfile({...profile, schema: newSchema});
                                }} 
                              />
                            </td>
                            <td>
                              <Form.Select size="sm" value={field.type} 
                                onChange={(e) => {
                                  const newSchema = [...profile.schema];
                                  newSchema[idx].type = e.target.value;
                                  setProfile({...profile, schema: newSchema});
                                }}
                              >
                                {Object.keys(profile.styles.types).map(t => <option key={t} value={t}>{t}</option>)}
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Select size="sm" value={field.sourceField || field.id} 
                                onChange={(e) => {
                                  const newSchema = [...profile.schema];
                                  newSchema[idx].sourceField = e.target.value;
                                  // Pokud nemáme nastavené ID, použijeme název sloupce
                                  if(!newSchema[idx].id) newSchema[idx].id = e.target.value;
                                  setProfile({...profile, schema: newSchema});
                                }}
                              >
                                <option value="">-- Vyberte sloupec --</option>
                                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                              </Form.Select>
                            </td>
                            <td>
                                <Button variant="outline-danger" size="sm" onClick={() => removeField(idx)}>×</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Tab>

                  <Tab eventKey="styles" title={<span><FiSettings className="me-1" /> Globální styly</span>}>
                    <div className="p-3">
                        {Object.keys(profile.styles.types).map((typeKey, index) => (
                        <div key={typeKey} className="mb-4 p-3 border border-secondary rounded bg-dark shadow-sm">
                            <Row className="align-items-center mb-3">
                            <Col md={6}>
                                <h5 className="text-primary mb-0 text-uppercase fw-bold">{typeKey}</h5>
                            </Col>
                            <Col md={6} className="text-end">
                                <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => {
                                    const newStyles = { ...profile.styles.types };
                                    delete newStyles[typeKey];
                                    updateProfile('styles.types', newStyles);
                                }}
                                >
                                Smazat
                                </Button>
                            </Col>
                            </Row>
                            <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="field-label text-muted small">Velikost (px)</Form.Label>
                                <Form.Control 
                                type="number" 
                                value={profile.styles.types[typeKey].fontSize} 
                                onChange={(e) => updateProfile(`styles.types.${typeKey}.fontSize`, parseInt(e.target.value))} 
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="field-label text-muted small">Barva textu</Form.Label>
                                <Form.Control 
                                type="color" 
                                value={profile.styles.types[typeKey].color || '#000000'} 
                                onChange={(e) => updateProfile(`styles.types.${typeKey}.color`, e.target.value)} 
                                />
                            </Col>
                            </Row>
                          </div>
                        ))}
                        <Button 
                        variant="outline-primary" 
                        className="w-100 mt-2"
                        onClick={() => {
                            const name = prompt("Zadejte název nového stylu:");
                            if (name) {
                            updateProfile(`styles.types.${name}`, { fontSize: 10, color: "#000000" });
                            }
                        }}
                        >
                        + Přidat nový typ stylu
                        </Button>
                    </div>
                  </Tab>

                  <Tab eventKey="raw" title={<span><FiFileText className="me-1" /> JSON Editor</span>}>
                        <div className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Label className="text-muted small mb-0">Přímá editace profilu</Form.Label>
                            {jsonError ? <Badge bg="danger">Chyba</Badge> : <Badge bg="success">Validní</Badge>}
                            </div>
                            <Form.Control
                            as="textarea"
                            value={jsonText}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            style={{ 
                                height: '500px', 
                                fontFamily: 'monospace', 
                                fontSize: '13px',
                                backgroundColor: '#1e1e1e',
                                color: '#d4d4d4',
                                border: jsonError ? '1px solid #dc3545' : '1px solid #333'
                            }}
                            />
                            {jsonError && <Alert variant="danger" className="mt-2 py-2 small">{jsonError}</Alert>}
                        </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
            {showPreview && csvData.length > 0 && profile && (
              <Card className="mt-4 border-0 shadow-lg">
                <Card.Body className="p-0">
                  <PdfPreview data={processPdfData(csvData, profile)} profile={profile} height="800px" />
                </Card.Body>
              </Card>
            )}
        </Row>
      </Container>
    </div>
  );
}