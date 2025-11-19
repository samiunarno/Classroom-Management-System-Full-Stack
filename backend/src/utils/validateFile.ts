export const validatePdfFile = (file: Express.Multer.File) => {
  if (!file) return { valid: false, error: "No file uploaded" };

  if (file.mimetype !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  // Normalize Chinese unicode + remove spaces
  const cleanName = file.originalname.trim().normalize("NFKC");

  console.log("🔥 CLEAN NAME:", cleanName);

  // EXACT pure Chinese + .pdf
  const regex = /^[\u4E00-\u9FFF]+\.pdf$/;

  if (!regex.test(cleanName)) {
    return {
      valid: false,
      error: "Filename must contain only Chinese characters and end with .pdf (e.g., 王小明.pdf)",
    };
  }

  return { valid: true };
};
