export const socialLinks = {
  github: 'https://github.com/lluke0',
  linkedin: 'https://linkedin.com/in/lluke0',
} as const;

// 프로토콜과 www를 뺀 표시용 주소 (예: github.com/lluke0)
export function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}
