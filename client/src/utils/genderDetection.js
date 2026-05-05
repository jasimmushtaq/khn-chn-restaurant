export const detectGender = (name) => {
    if (!name) return 'Other';
    const lowerName = name.toLowerCase().trim();

    // Check for explicit titles
    if (/\b(mr|mr\.|shree|shri|sir|man|boy)\b/.test(lowerName)) return 'Male';
    if (/\b(mrs|mrs\.|ms|ms\.|miss|lady|girl|smt|smt\.|devi|begum|kaur)\b/.test(lowerName)) return 'Female';

    // Heuristics for common Indian gender markers in names
    // Note: These are common patterns and not 100% accurate, but fit the "automation" requirement.
    
    // Common Female Names/Endings
    if (/\b(noor|fatima|zoya|aisha|sana|riya|anita|priya|kajal|reena|meena|sunita|pooja|neha|simran|diksha|palak|ananya|isha|tanya|muskan)\b/.test(lowerName)) return 'Female';
    
    // Common Male Names/Endings
    if (/\b(rahul|amit|rohit|sumit|mohammad|vicky|arun|sanjay|vijay|deepak|sunil|anil|pankaj|raj|manish|sandeep|vivek|nitin|ajay|aman|arjun)\b/.test(lowerName)) return 'Male';

    // Female markers (Suffixes)
    if (lowerName.endsWith('devi') || 
        lowerName.endsWith('kaur') || 
        lowerName.endsWith('कुमारी') ||
        lowerName.endsWith('बेगम') ||
        lowerName.endsWith(' कुमारी') ||
        lowerName.endsWith(' खानम') ||
        lowerName.endsWith(' bano') ||
        lowerName.endsWith(' khatoon')) return 'Female';

    // Male markers (Suffixes)
    if (lowerName.endsWith('kumar') || 
        lowerName.endsWith('singh') || 
        lowerName.endsWith('alam') ||
        lowerName.endsWith('prasad') ||
        lowerName.endsWith(' khan') ||
        lowerName.endsWith(' saini') ||
        lowerName.endsWith(' verma') ||
        lowerName.endsWith(' sharma')) return 'Male';

    // Phonetic heuristics (South Asian context)
    // Names ending in 'a', 'i', 'ee' are statistically more likely to be female
    if (lowerName.endsWith('a') && !lowerName.endsWith('raza') && !lowerName.endsWith('mulla')) return 'Female';
    if (lowerName.endsWith('i') || lowerName.endsWith('ee')) return 'Female';

    // Default to 'Other' if unsure
    return 'Other';
};
