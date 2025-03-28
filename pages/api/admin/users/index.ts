import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: users });
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching users',
        });
      }

    case 'POST':
      try {
        const { name, email, password, role, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered',
          });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          phoneNumber,
        });

        // Remove password from response
        const userResponse = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
        };

        return res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: userResponse,
        });
      } catch (error: any) {
        console.error('Error creating user:', error);
        return res.status(400).json({
          success: false,
          message: error.message || 'Error creating user',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 