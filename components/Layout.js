import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { FiHome, FiMap } from 'react-icons/fi';

const Layout = ({ children, pageTitle = "NicePDF" }) => {
  return (
    <><div className="main-wrapper">
      <Head>
        <title>{`${pageTitle} | NicePDFCreator`}</title>
      </Head>
     
        <Navbar className="custom-navbar mb-4">
          <Container>
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
                <Navbar.Brand className="brand-text">
                Nice<span>PDF</span>Creator
                </Navbar.Brand>
            </Link>
            <Badge bg="primary">v1.0</Badge>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                    <Link href="/" passHref legacyBehavior>
                    <Nav.Link className="nav-link-custom">
                        <FiHome className="me-1" /> Generátor
                    </Nav.Link>
                    </Link>
                    <Link href="/mapping" passHref legacyBehavior>
                    <Nav.Link className="nav-link-custom">
                        <FiMap className="me-1" /> Editor Profilu
                    </Nav.Link>
                    </Link>
                    <Link href="/visual-mapping" passHref legacyBehavior>
                    <Nav.Link className="nav-link-custom">
                        <FiMap className="me-1" /> Visual Editor
                    </Nav.Link>
                    </Link>
                </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;