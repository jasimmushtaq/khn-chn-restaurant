const filterPII = (text) => {
  if (!text || text.trim().length === 0 || text.length > 500) {
    return null;
  }

  let cleaned = text;

  // Regex for Indian phone numbers: +91, 10-digit, with spaces/dashes
  // Matches: +91 9999999999, 9999999999, 09999999999, 99999-99999, etc.
  const phoneRegex = /(\+91[\-\s]?)?[0]?[6789]\d{9}|(\+91[\-\s]?)?[0]?([6789]\d{2}[\-\s]\d{3}[\-\s]\d{4})/g;
  cleaned = cleaned.replace(phoneRegex, '[PHONE REMOVED]');

  // Regex for emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  cleaned = cleaned.replace(emailRegex, '[EMAIL REMOVED]');

  // Regex for URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  cleaned = cleaned.replace(urlRegex, '[URL REMOVED]');

  // Basic Profanity Filter
  const vulgarities = [
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 
    'motherfucker', 'cock', 'fag', 'retard', 'nigger', 'rape', 'porn',
    'chutiya', 'madarchod', 'behenchod', 'gandu', 'lawda'
  ];
  
  vulgarities.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '****');
  });

  return cleaned;
};

module.exports = { filterPII };
