export const parseYoutubeURL = (url: string) => {
  const match =
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/
    ) ||
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/
    ) ||
    // eslint-disable-next-line no-useless-escape
    url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);

  if (match && match[2].length === 11)
    return 'https' + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
  
  return null;
}