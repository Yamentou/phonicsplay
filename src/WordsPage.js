import React, { useState, useEffect } from 'react';
import { Button, Form, Container } from 'react-bootstrap';

const WordsPage = ({ filename, label }) => {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hiddenWords, setHiddenWords] = useState([]);
  const [autoRead, setAutoRead] = useState(false);
  const [spellBeforeRead, setSpellBeforeRead] = useState(false);

  useEffect(() => {
    fetch(`/learning_words/${filename}`)
      .then(response => response.text())
      .then(data => {
        const wordList = data.split('\n').filter(word => word.trim() !== '');
        setWords(wordList);
        setCurrentWordIndex(0);
      });

    const hiddenWordsFromStorage = JSON.parse(localStorage.getItem('hiddenWords')) || [];
    setHiddenWords(hiddenWordsFromStorage);
    setAutoRead(JSON.parse(localStorage.getItem('autoRead')) || false);
    setSpellBeforeRead(JSON.parse(localStorage.getItem('spellBeforeRead')) || false);
  }, [filename]);

  const readWordAloud = (word) => {
    if (word.length <= 1 && spellBeforeRead) return;

    const utterance = new SpeechSynthesisUtterance();
    if (spellBeforeRead && word.length > 1) {
      word.split('').forEach(letter => {
        utterance.text += letter + ' ';
      });
    }
    utterance.text += word;
    speechSynthesis.speak(utterance);
  };

  const handleNextWord = () => {
    let nextIndex = currentWordIndex + 1;
    while (nextIndex < words.length && hiddenWords.includes(words[nextIndex])) {
      nextIndex++;
    }
    if (nextIndex < words.length) {
      setCurrentWordIndex(nextIndex);
      if (autoRead) readWordAloud(words[nextIndex]);
    }
  };

  const handlePrevWord = () => {
    let prevIndex = currentWordIndex - 1;
    while (prevIndex >= 0 && hiddenWords.includes(words[prevIndex])) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      setCurrentWordIndex(prevIndex);
      if (autoRead) readWordAloud(words[prevIndex]);
    }
  };

  const handleHideWord = () => {
    const wordToHide = words[currentWordIndex];
    const updatedHiddenWords = [...hiddenWords, wordToHide];
    setHiddenWords(updatedHiddenWords);
    localStorage.setItem('hiddenWords', JSON.stringify(updatedHiddenWords));
    handleNextWord();
  };

  const resetHiddenWords = () => {
    setHiddenWords([]);
    localStorage.removeItem('hiddenWords');
  };

  useEffect(() => {
    localStorage.setItem('autoRead', JSON.stringify(autoRead));
  }, [autoRead]);

  useEffect(() => {
    localStorage.setItem('spellBeforeRead', JSON.stringify(spellBeforeRead));
  }, [spellBeforeRead]);

  return (
    <Container className="text-center mt-4">
      <h2>{label}</h2>
      {words.length > 0 ? (
        <>
          <h1 style={{ fontSize: '8rem' }}>{words[currentWordIndex]}</h1>
          <div className="mt-4">
            <Button onClick={handlePrevWord} style={{ marginRight: '10px' }}>Previous</Button>
            <Button onClick={() => readWordAloud(words[currentWordIndex])} style={{ marginRight: '10px' }}>Read Aloud</Button>
            <Button onClick={handleNextWord} style={{ marginRight: '10px' }}>Next</Button>
            <Button onClick={handleHideWord} style={{ marginRight: '10px' }}>Hide Word</Button>
          </div>
        </>
      ) : (
        <h1>No words to display</h1>
      )}

      <div className="text-center mt-4">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Form.Check
            type="checkbox"
            label="Automatically read word"
            checked={autoRead}
            onChange={(e) => setAutoRead(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            label="Spell before reading"
            checked={spellBeforeRead}
            onChange={(e) => setSpellBeforeRead(e.target.checked)}
          />
        </div>
        <Button onClick={resetHiddenWords} className="mt-3">Reset Hidden Words</Button>
      </div>
    </Container>
  );
};

export default WordsPage;
