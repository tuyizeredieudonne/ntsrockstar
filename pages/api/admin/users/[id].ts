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

  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const { name, email, password, role, phoneNumber } = req.body;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }

        // Update user fields
        user.name = name;
        user.email = email;
        user.role = role;
        user.phoneNumber = phoneNumber;

        // Update password if provided
        if (password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        // Remove password from response
        const userResponse = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
        };

        return res.status(200).json({
          success: true,
          message: 'User updated successfully',
          data: userResponse,
        });
      } catch (error: any) {
        console.error('Error updating user:', error);
        return res.status(400).json({
          success: false,
          message: error.message || 'Error updating user',
        });
      }

    case 'DELETE':
      try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'User deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting user',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 