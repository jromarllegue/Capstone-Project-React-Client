export default function captureConsoleLogs(iframe) {
  const consoleLogsDiv = document.getElementById('console-logs');
  
  // Add message listener to parent window
  window.addEventListener('message', function(event) {
      if (event.data.type === 'console') {
          appendLog(event.data.message, event.data.level);
      }
  });

  // Inject console override script into iframe
  const script = `
      window.console = {
          log: function(msg) {
              window.parent.postMessage({type: 'console', level: 'log', message: msg}, '*');
          },
          error: function(msg) {
              window.parent.postMessage({type: 'console', level: 'error', message: msg}, '*');
          },
          warn: function(msg) {
              window.parent.postMessage({type: 'console', level: 'warning', message: msg}, '*');
          }
      };
  `;

  iframe.contentWindow.postMessage({type: 'injectScript', script: script}, '*');
}
// output.onload = () => captureConsoleLogs(output);