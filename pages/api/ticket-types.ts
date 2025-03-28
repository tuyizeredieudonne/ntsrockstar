import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import TicketType from '../../models/TicketType';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  // Get the session
  const session = await getServerSession(req, res, authOptions);
  
  // For POST, PUT, DELETE operations, validate admin role
  if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && 
      (!session || session.user?.role !== 'admin')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const ticketTypes = await TicketType.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: ticketTypes });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;
      
    case 'POST':
      try {
        console.log('Creating ticket type with data:', req.body);
        const ticketType = await TicketType.create(req.body);
        res.status(201).json({ success: true, data: ticketType });
      } catch (error) {
        console.error('Error creating ticket type:', error);
        res.status(400).json({ success: false, error });
      }
      break;
      
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
} 