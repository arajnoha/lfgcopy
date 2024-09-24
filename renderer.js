// Ensure your renderer.js is set up to receive updates and handle deletions
window.electronAPI.onClipboardUpdate((event, clipboardHistory) => {
  const list = document.getElementById('clipboard-list');
  list.innerHTML = ''; // Clear current list

  clipboardHistory.forEach((item, index) => {
    const listItem = document.createElement('li');

    // Display the clipboard text, source application, and timestamp
    listItem.innerHTML = `
      ${item.text} 
      <b>(${item.sourceApp})</b> 
      <span style="color:gray; font-size: 0.9em;">[Added: ${item.timestamp}]</span>
    `;

    // Create the "Use" button to paste the selected clipboard entry
    const useButton = document.createElement('button');
    useButton.textContent = 'Copy';
    useButton.onclick = () => {
      window.electronAPI.setClipboardText(item.text);
    };


    // Append buttons to the list item
    listItem.appendChild(useButton);
    list.appendChild(listItem);
  });
});

