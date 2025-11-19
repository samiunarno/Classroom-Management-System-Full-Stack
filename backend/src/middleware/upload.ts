import multer from 'multer';

// Use memory storage to avoid saving files locally
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (আপনার প্রয়োজন অনুযায়ী সাইজ বাড়াতে পারেন)
  },
  fileFilter: (req, file, cb) => {
    // সব ধরনের ফাইল গ্রহণ
    cb(null, true);  // কোনো ফাইল টাইপ চেক করা হচ্ছে না, সব অনুমোদিত
  },
});
