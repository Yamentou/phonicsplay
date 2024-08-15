import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown, Button, Form } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import ReadingPage from './components/ReadingPage';

const App = () => {
  const [sections, setSections] = useState([]);
  const [hiddenWords, setHiddenWords] = useState([]);
  const [autoRead, setAutoRead] = useState(false);
  const [spellBeforeRead, setSpellBeforeRead] = useState(false);
  const [fileLabels, setFileLabels] = useState({});

  useEffect(() => {
    fetch('/settings.txt')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const sectionList = {};
        lines.forEach(line => {
          const [filename, label] = line.split('=');
          sectionList[filename] = label;
        });
        setFileLabels(sectionList);
        setSections(Object.keys(sectionList));
      });

    const hiddenWordsFromStorage = JSON.parse(localStorage.getItem('hiddenWords')) || [];
    setHiddenWords(hiddenWordsFromStorage);
    setAutoRead(JSON.parse(localStorage.getItem('autoRead')) || false);
    setSpellBeforeRead(JSON.parse(localStorage.getItem('spellBeforeRead')) || false);
  }, []);

  useEffect(() => {
    localStorage.setItem('hiddenWords', JSON.stringify(hiddenWords));
  }, [hiddenWords]);

  useEffect(() => {
    localStorage.setItem('autoRead', JSON.stringify(autoRead));
  }, [autoRead]);

  useEffect(() => {
    localStorage.setItem('spellBeforeRead', JSON.stringify(spellBeforeRead));
  }, [spellBeforeRead]);

  const handleAutoReadChange = (checked) => {
    setAutoRead(checked);
  };

  const handleSpellBeforeReadChange = (checked) => {
    setSpellBeforeRead(checked);
  };

  const handleResetHiddenWords = () => {
    localStorage.removeItem('hiddenWords');
    setHiddenWords([]);
  };

  return (
    <Container fluid>
      <Navbar bg="light" expand="lg" className="container-fluid">
        <Navbar.Brand as={Link} to="/">Phonics Play</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="Words Files" id="basic-nav-dropdown">
              {sections.map(section => (
                <NavDropdown.Item
                  key={section}
                  as={Link}
                  to={`/reading/${section}`}
                >
                  {fileLabels[section]}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link as={Link} to="/hidden-words">Show Hidden Words</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/reading/:filename" 
          element={
            <ReadingPage 
              hiddenWords={hiddenWords}
              setHiddenWords={setHiddenWords}
              autoRead={autoRead}
              spellBeforeRead={spellBeforeRead}
              onAutoReadChange={handleAutoReadChange}
              onSpellBeforeReadChange={handleSpellBeforeReadChange}
              onResetHiddenWords={handleResetHiddenWords}
              fileLabels={fileLabels}
            />} 
        />
        <Route path="/hidden-words" element={<HiddenWordsPage hiddenWords={hiddenWords} />} />
      </Routes>

      <footer className="bg-light text-center p-3 container-fluid mt-4">
        <p>&copy; 2024 Phonics Play. All rights reserved. Developed by <a href="https://yamentou.com" target='_new'>Lionnel Yamentou</a> for <a href='https://xhuma.us' target='_new'>Xhuma Solutions</a>.</p>
      </footer>
    </Container>
  );
};

const HiddenWordsPage = ({ hiddenWords }) => (
  <div className="text-center mt-4">
    <h2>Hidden Words</h2>
    {hiddenWords.length > 0 ? (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {hiddenWords.map((word, index) => (
          <li key={index} style={{ fontSize: '2rem', marginBottom: '5px' }}>{word}</li>
        ))}
      </ul>
    ) : (
      <p>No hidden words</p>
    )}
  </div>
);

export default App;
