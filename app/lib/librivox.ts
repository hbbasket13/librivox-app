/**
 * LibriVox 책의 표지 이미지 URL을 만들어 돌려줍니다.
 *
 * url_zip_file 예시:
 *   https://www.archive.org/download/count_monte_cristo_0711_librivox/...
 *   https://archive.org/download/count_monte_cristo_0711_librivox/...
 *   https://www.archive.org/compress/count_monte_cristo_0711_librivox/...
 */
export function getCoverUrl(
  urlZipFile?: string,
  bookId?: string
): string | null {
  if (urlZipFile) {
    // /download/, /compress/, /details/ 어떤 형태든 item ID 추출
    const match = urlZipFile.match(
      /archive\.org\/(?:download|compress|details)\/([^/?#]+)/
    );
    if (match) {
      return `https://archive.org/services/img/${match[1]}`;
    }
  }

  return null;
}