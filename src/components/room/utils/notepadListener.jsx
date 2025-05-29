import { nonEditingKey, editingKey, unknownKey } from './keyHandler';

export default function notepadListener (event, updateNotes) {
    try {  
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            updateNotes();
            return;
        }

        if (!nonEditingKey(event) && (event.key.length === 1 || editingKey(event) || unknownKey(event))) {
            updateNotes();
        }
    } catch (e) {
      console.error(e);
    }
  };    
