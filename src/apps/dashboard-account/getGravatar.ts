import md5 from 'crypto-js/md5';

// Utility that check if a Gravatar exists for this email address
// and, if so, returns the Gravatar URL
export const getGravatar = (email: string): Promise<string | undefined> => new Promise(resolve => {
  const hash = md5(email.trim().toLowerCase());

  // Returns image + forces a 404 if no Gravatar profile exists
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=180&d=404`;
  
  const img = new Image();
  img.onload = () => resolve(gravatarUrl);
  img.onerror = () => resolve(undefined);

  img.src = gravatarUrl;  
});