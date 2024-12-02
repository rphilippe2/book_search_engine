import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

const secretKey = process.env.JWT_SECRET_KEY || '';

// Function to verify the token and extract user data
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, secretKey) as JwtPayload;
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
};

// Function to sign a new token
export const signToken = (username: string, email: string, _id: string): string => {
  const payload = { username, email, _id };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Function to authenticate and verify the token in the request
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  // Verify the token
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Attach the user to the request object
  req.user = user;

  next(); // Call the next middleware or route handler
};

// Apollo Server context function
export const context = ({ req }: { req: any }) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const user = token ? verifyToken(token) : null;

  // Return the context wrapped in a resolved Promise
  return Promise.resolve({ user });
};
