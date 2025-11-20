/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES || "1h") as any,
  };

  return jwt.sign({ userId }, secret, options);
};

// import jwt from 'jsonwebtoken';

// export const generateToken = (userId: string): string => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
//     expiresIn: process.env.JWT_EXPIRES || '1h',
//   });
// };
