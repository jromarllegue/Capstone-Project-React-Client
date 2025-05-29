import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfirmPopup, AlertPopup } from './PopupWindows';

export function showConfirmPopup(props) {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function destroy() {
      root.unmount();
      container.remove();
    }

    root.render(
      <ConfirmPopup
        {...props}
        onConfirm={() => {
          destroy();
          resolve(true);
        }}
        onCancel={() => {
          destroy();
          resolve(false);
        }}
        onExit={() => {
          destroy();
          resolve(null);
        }}
      />
    );
  });
}

export function showAlertPopup(props) {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function destroy() {
      root.unmount();
      container.remove();
    }

    root.render(
      <AlertPopup
        {...props}
        onOkay={() => {
          destroy();
          resolve(true);
        }}
        onExit={() => {
          destroy();
          resolve(null);
        }}
      />
    );
  });
}
