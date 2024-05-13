// Import necessary modules

// Define constants for Google Translate API
const API_ENDPOINT = 'https://clients5.google.com/translate_a/t';

// Function to translate text using Google Translate API
async function translateText(text: string, targetLanguage: string) {
  const queryParams = new URLSearchParams({
    client: 'dict-chrome-ex',
    sl: 'auto', // Source language (auto-detect)
    tl: targetLanguage, // Target language
    q: text // Text to translate
  });

  const response = await fetch(`${API_ENDPOINT}?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  const data = await response.json();
  
  // Extract translated text from the response
  const translatedText = data;

  return translatedText;
}

// Named function to handle POST requests
export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return Response.json({ message: 'Method Not Allowed' });
    }

    // Read the body of the request as text
    const requestBody = await req.text();

    // Convert the request body from string to JSON
    const requestData = JSON.parse(requestBody);

    // Extract the necessary fields
    const { q, tl } = requestData;

    if (!q || !tl) {
      return Response.json({ message: 'Bad Request - Missing required fields' });
    }

    // Call the translation function
    const translatedText = await translateText(q, tl);

    // Send the translated text in the response
    return Response.json({ text: translatedText });
  } catch (error) {
    console.error('Error occurred during translation:', error);
    return Response.json({ message: 'Internal Server Error' });
  }
}
