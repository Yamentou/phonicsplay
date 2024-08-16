import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const ReadingPage = ({ hiddenWords, setHiddenWords, autoRead, spellBeforeRead, onAutoReadChange, onSpellBeforeReadChange, onResetHiddenWords, fileLabels }) => {
  const { filename } = useParams();
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/learning_words/${filename}`)
      .then(response => response.text())
      .then(data => {
        console.log(data);
        const wordList = data.split('\n').filter(word => word.trim() !== '');
        setWords(wordList);
        setCurrentWordIndex(0);
      });
  }, [filename]);

  const readWordAloud = (word) => {
    if (word.length <= 1 && spellBeforeRead) return; // Avoid spelling single-letter words twice

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
    localStorage.setItem('hiddenWords', JSON.stringify(updatedHiddenWords));
    setHiddenWords(updatedHiddenWords);
    handleNextWord();
  };

  return (
    <div className="text-center mt-4">
      {words.length > 0 ? (
        <>
          <h2>{fileLabels[filename] || filename}</h2>
          <h1 style={{ fontSize: '8rem' }}>{words[currentWordIndex]}</h1>
          <div className="mt-4">
            <Button onClick={handlePrevWord} style={{ marginRight: '10px' }}>Previous</Button>
            <Button onClick={() => readWordAloud(words[currentWordIndex])} style={{ marginRight: '10px' }} className='btn-warning'>Read Aloud</Button>
            <Button onClick={handleNextWord} style={{ marginRight: '10px' }}>Next</Button>
            <Button onClick={handleHideWord} style={{ marginRight: '10px' }} className='btn-danger'>Hide Word</Button>
          </div>

          <div className="mt-4">
            <Form.Check
              inline
              type="switch"
              label="Automatically read word"
              checked={autoRead}
              onChange={(e) => onAutoReadChange(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            <Form.Check
              inline
              type="switch"
              label="Spell before reading"
              checked={spellBeforeRead}
              onChange={(e) => onSpellBeforeReadChange(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
          </div>
          <Button onClick={onResetHiddenWords} className="mt-4 btn-dark">Reset Hidden Words</Button>
        </>
      ) : (
        <h1>Select a section to begin</h1>
      )}
    </div>
  );
};

export default ReadingPage;
