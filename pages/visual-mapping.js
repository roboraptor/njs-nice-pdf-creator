import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Navbar, Nav } from 'react-bootstrap';
import { FiMove, FiPlus, FiTrash2, FiSave, FiLayout, FiMaximize2, FiHome } from 'react-icons/fi';
import Papa from 'papaparse';
import Link from 'next/link';
// DND Kit Importy
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- KOMPONENTA PRO JEDNOTLIVÉ POLE V CANVASU ---
const SortableField = ({ field, idx, onRemove, onChangeWidth }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id + idx });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const colSize = field.width === '25%' ? 3 : field.width === '50%' ? 6 : field.width === '75%' ? 9 : 12;

  

  return (
    <Col xs={colSize} ref={setNodeRef} style={style}>
      <Card className="h-100 shadow-sm border-secondary position-relative bg-light text-dark">
        <Card.Body className="p-2">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <div {...attributes} {...listeners} style={{ cursor: 'grab' }} className="text-muted">
              <FiMove size={14} />
            </div>
            <div className="d-flex gap-1">
              <Button size="sm" variant="link" className="p-0 text-primary" onClick={() => onChangeWidth(idx)}><FiMaximize2 size={12} /></Button>
              <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => onRemove(idx)}><FiTrash2 size={12} /></Button>
            </div>
          </div>
          <div className="text-truncate fw-bold small mb-1">{field.label}</div>
          <Badge bg="info" style={{ fontSize: '9px' }}>{field.id}</Badge>
        </Card.Body>
      </Card>
    </Col>
  );
};



export default function VisualMapping() {
  const [profile, setProfile] = useState({ meta: {}, schema: [], styles: { types: {} } });
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [profileName, setProfileName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // --- LOGIKA NAHRÁVÁNÍ (Stejná jako v index.js) ---
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setProfile(JSON.parse(ev.target.result));
      reader.readAsText(file);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, { header: true, complete: (res) => res.data[0] && setCsvHeaders(Object.keys(res.data[0])) });
    }
  };

  // --- MANIPULACE S POLI ---
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = profile.schema.findIndex((_, i) => (active.id === profile.schema[i].id + i));
      const newIndex = profile.schema.findIndex((_, i) => (over.id === profile.schema[i].id + i));
      const newSchema = arrayMove(profile.schema, oldIndex, newIndex);
      setProfile({ ...profile, schema: newSchema });
    }
  };

  const addField = (h) => setProfile(p => ({ ...p, schema: [...p.schema, { id: h, label: h, type: 'body', width: '100%' }] }));
  
  const removeField = (idx) => setProfile(p => ({ ...p, schema: p.schema.filter((_, i) => i !== idx) }));

  const changeWidth = (idx) => {
    const widths = ['25%', '50%', '75%', '100%'];
    setProfile(p => {
      const s = [...p.schema];
      const cur = s[idx].width || '100%';
      s[idx].width = widths[(widths.indexOf(cur) + 1) % widths.length];
      return { ...p, schema: s };
    });
  };

  const saveProfile = () => {
    if (!profile) return;

    // Převedeme objekt na text s odsazením 2 mezery
    const jsonString = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Vytvoříme dočasný odkaz pro stažení
    const link = document.createElement("a");
    link.href = url;
    link.download = profileName || "custom-profile.json";
    document.body.appendChild(link);
    link.click();
    
    // Vyčistíme paměť
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-dark min-vh-100 text-white font-sans">
      <Navbar bg="dark" variant="dark" className="border-bottom border-secondary shadow">
        <Container fluid>
          <Navbar.Brand className="fw-bold"><FiLayout className="me-2 text-primary" /> Visual Architect</Navbar.Brand>
          <Link href="/" passHref><Button variant="outline-light" size="sm"><FiHome /> Zpět</Button></Link>
        </Container>
      </Navbar>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Row className="g-0">
          {/* PANEL DOSTUPNÝCH POLÍ */}
          <Col md={3} className="bg-dark border-end border-secondary p-3" style={{ height: '92vh', overflowY: 'auto' }}>
            <Card className="bg-dark border-secondary mb-4 text-white">
              <Card.Body className="p-3">
                <Form.Label className="small text-muted">Profil</Form.Label>
                <Form.Control type="file" size="sm" className="bg-dark text-white border-secondary mb-2" onChange={handleProfileUpload} />
                <Form.Label className="small text-muted">CSV Data</Form.Label>
                <Form.Control type="file" size="sm" className="bg-dark text-white border-secondary" onChange={handleCsvUpload} />
              </Card.Body>
            </Card>

            <h6 className="text-muted small text-uppercase fw-bold mb-3 px-2">Dostupná pole</h6>
            <div className="d-flex flex-column gap-2 px-1">
              {csvHeaders.map(h => (
                <div key={h} className="bg-secondary p-2 rounded d-flex justify-content-between align-items-center shadow-sm hover-bright" 
                     onClick={() => addField(h)} style={{ cursor: 'copy' }}>
                  <span className="small">{h}</span>
                  <FiPlus size={14} />
                </div>
              ))}
            </div>
            
            <Button variant="primary" className="w-100 mt-4 py-2 fw-bold" onClick={saveProfile}>
                <FiSave className="me-2" /> Uložit Profil
            </Button>
          </Col>

          {/* CANVAS PLOCHA */}
          <Col md={9} className="p-5 bg-black d-flex justify-content-center overflow-auto" style={{ height: '92vh' }}>
            <div className="bg-white shadow-lg p-5 rounded-sm" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="border-bottom border-primary border-3 mb-5 pb-3 text-dark">
                <h2 className="fw-bold mb-1">{profile?.meta?.title || "Název reportu"}</h2>
                <div className="text-muted small">{profile?.meta?.project} • {profile?.meta?.author}</div>
              </div>

              <SortableContext items={profile.schema.map((f, i) => f.id + i)} strategy={verticalListSortingStrategy}>
                <Row className="g-3">
                  {profile.schema.map((field, idx) => (
                    <SortableField 
                      key={field.id + idx} 
                      field={field} 
                      idx={idx} 
                      onRemove={removeField} 
                      onChangeWidth={changeWidth} 
                    />
                  ))}
                </Row>
              </SortableContext>
            </div>
          </Col>
        </Row>
      </DndContext>
    </div>
  );
}