import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import TicketType from '../../../models/TicketType';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;
  
  // Get the session
  const session = await getServerSession(req, res, authOptions);
  
  // For PUT, DELETE operations, validate admin role
  if ((method === 'PUT' || method === 'DELETE') && 
      (!session || session.user?.role !== 'admin')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const ticketType = await TicketType.findById(id);
        if (!ticketType) {
          return res.status(404).json({ success: false, message: 'Ticket type not found' });
        }
        res.status(200).json({ success: true, data: ticketType });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;
      
    case 'PUT':
      try {
        const ticketType = await TicketType.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!ticketType) {
          return res.status(404).json({ success: false, message: 'Ticket type not found' });
        }
        res.status(200).json({ success: true, data: ticketType });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;
      
    case 'DELETE':
      try {
        const deletedTicketType = await TicketType.findByIdAndDelete(id);
        if (!deletedTicketType) {
          return res.status(404).json({ success: false, message: 'Ticket type not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;
      
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
} 