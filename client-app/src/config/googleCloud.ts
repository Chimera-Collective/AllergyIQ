const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_CREDENTIALS;

console.log('API Key loaded:', apiKey ? 'Present' : 'Missing'); // Debug log

if (!apiKey) {
  throw new Error('VITE_GOOGLE_CLOUD_CREDENTIALS is not set in environment variables');
}

export const googleCloudConfig = {
  apiKey,
  apiEndpoint: 'https://vision.googleapis.com/v1/images:annotate'
} as const;