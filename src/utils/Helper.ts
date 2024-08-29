export const getMimeType = (b64String: string): string => {
  const b64Data = b64String.replace(/^data:.+;base64,/, '')
  const firstCharacter = b64Data[0];
  switch (firstCharacter) {
    case '/':
      return 'image/jpeg';
    case 'i':
      return 'image/png';
    case 'U':
      return 'image/webp';
    default:
      return 'unknown';
  }
}