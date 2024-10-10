// Simple helper to clear the selection hash from the URL
export const clearSelectionURLHash = (backButton?: boolean) => {
  const nextURL = 
    `${window.location.pathname}${window.location.search}`;

  if (backButton) {
    // pushState creates a history entry for the Back button
    window.history.pushState({ selected: [] }, '', nextURL);
  } else {
    // replaceState does not create history entries
    window.history.replaceState({ selected: [] }, '', nextURL);
  }
}