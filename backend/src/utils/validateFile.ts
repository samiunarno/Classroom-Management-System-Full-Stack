export const validatePdfFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file uploaded' };
  }

  // Check file type
  if (file.mimetype !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  // Check filename pattern (Chinese characters + .pdf)
  const filenameRegex = /^[\u4E00-\u9FFF]+\.pdf$/;
  if (!filenameRegex.test(file.originalname)) {
    return { 
      valid: false, 
      error: 'Filename must contain only Chinese characters and end with .pdf (e.g., 王小明.pdf)' 
    };
  }

  return { valid: true };
};