import React, { useState, useEffect } from 'react';

function TypeWriter({ text }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      setTimeout(() => {
        setCurrentText(currentText + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 50);
    }
  }, [currentText, currentIndex, text]);

  return <div>{currentText}</div>;
}

export default TypeWriter;
