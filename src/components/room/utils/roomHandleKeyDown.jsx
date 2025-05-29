export function handleKeyDownAssigned (event, setLeftDisplay, setRightDisplay, room_files, displayFile, startRunOutput, startRunOutputFullView) {
    if (event.altKey && event.key === 'f') {
      event.preventDefault();
      setLeftDisplay('files');
      return;
    }
    
    if (event.altKey && event.key === 'n') {
      event.preventDefault();
      setLeftDisplay('notepad');
      return;
    }

    if (event.altKey && event.key === 'o') {
      event.preventDefault();
      setRightDisplay('output');
      return;
    }

    if (event.altKey && event.key === 'h') {
      event.preventDefault();
      setRightDisplay('history');
      return;
    }

    if (event.altKey && event.key === 'b') {
      event.preventDefault();
      setRightDisplay('feedback');
      return;
    }

    if (event.altKey && event.key === 'r') {
      event.preventDefault();
      setRightDisplay('output');
      startRunOutput();
      return;
    }

    if (event.altKey && event.key === '\\') {
      event.preventDefault();
      startRunOutputFullView();
      return;
    }

    if (event.altKey && event.key === 'l') {
      setLeftDisplay('');
    }

    if (event.altKey && event.key === 'p') {
        setRightDisplay('');
    }

    for (let i = 1; i <= room_files.length || i <= 10; i++) {
      if (event.altKey && event.key === i.toString()) {
        event.preventDefault();
        displayFile(room_files[i - 1]);
        break;
      }
    }
  };
