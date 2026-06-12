function generateShortCode(length = 6) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueShortCode(URLModel) {
  let shortCode;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    shortCode = generateShortCode();
    exists = await URLModel.findOne({ shortCode });
    attempts++;
  }
  if (exists) {
    throw new Error(
      'Could not generate a unique short code. Please try again.'
    );
  }
  return shortCode;
}

module.exports = { generateShortCode, generateUniqueShortCode };
