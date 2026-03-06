// Local fallback certifications (used only if the PHP backend isn't available).
// Prefer managing certifications via the admin panel on shared hosting.
//
// Shape:
// {
//   name: string,
//   issuer?: string,
//   issued?: string,
//   credentialId?: string,
//   verifyUrl?: string,
//   fileUrl?: string, // public URL to an image/pdf
// }

export const certifications = [];

