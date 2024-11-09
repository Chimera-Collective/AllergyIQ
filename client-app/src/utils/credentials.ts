export function encodeCredentials(jsonCredentials: object): string {
    const jsonString = JSON.stringify(jsonCredentials);
    const utf8String = unescape(encodeURIComponent(jsonString));
    return btoa(utf8String);
  }