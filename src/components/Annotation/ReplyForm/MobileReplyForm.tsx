import { useState } from 'react';
import { createPortal } from 'react-dom';

import './MobileReplyForm.css';
import { X } from '@phosphor-icons/react';

export const MobileReplyForm = () => {
  
  const [open, setOpen] = useState(false);

  const onSave = () => {
    // TODO
  }

  return open ? createPortal(
    <div className="mobile-reply-form">
      <div className="mobile-reply-form-close">
        <button onClick={() => setOpen(false)}><X /></button>
      </div>

      <textarea autoFocus/>

      <div className="mobile-reply-form-footer">
        <button onClick={onSave}>Save</button>
        <button onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>,
    
    document.body
  ) : (
    <button onClick={() => setOpen(true)}>
      Reply...
    </button>
  )


}