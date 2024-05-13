
// Define constants for Bing Translation API
const API_ENDPOINT = 'https://www.bing.com/ttranslatev3';
const HEADERS = {
    "Host": "www.bing.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Referer": "https://www.bing.com/",
    "Content-Type": "application/x-www-form-urlencoded",
    "Connection": "keep-alive"
};
const PARAMS = {
  IG: '839D27F8277F4AA3B0EDB83C255D0D70',
  IID: 'translator.5033.3',
};

// Function to translate text using Bing Translation API
async function translateText(text: string, targetLanguage: string) {
  const body = new URLSearchParams({
    text: text,
    fromLang: 'auto-detect',
    to: targetLanguage,
  });

  const response = await fetch(`${API_ENDPOINT}?IG=${PARAMS.IG}&IID=${PARAMS.IID}`, {
    method: 'POST',
    headers: HEADERS,
    body: body,
  });

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  console.log('Response:', response);

  const data = await response.text();
  return data;
}

// Named function to handle POST requests
export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
        Response.json({ message: 'Method Not Allowed' });
    }

    let data = await req.json();

    const { q, tl } = data;

    if (!q || !tl) {
      return Response.json({ message: 'Bad Request' });
    }

    const translatedText = await translateText(q, tl);

    return Response.json({ text: translatedText });
  } catch (error) {
    console.error('Error occurred during translation:', error);
    return Response.json({ message: 'Internal Server Error' });
  }
}
