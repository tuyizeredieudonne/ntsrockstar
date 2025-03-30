import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import { CheckCircle, AccessTime } from '@mui/icons-material';

// Define ticket type interface
interface Ticket {
  _id: string;
  name: string;
  price: number;
  discountPrice: number;
  description: string;
  features: string[];
  discountEndTime: string;
}

interface TicketSelectionProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticket: Ticket) => void;
}

const TicketSelection: React.FC<TicketSelectionProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket
}) => {
  const theme = useTheme();

  // Calculate if a ticket is in discount period
  const isDiscounted = (ticket: Ticket): boolean => {
    return new Date() < new Date(ticket.discountEndTime);
  };

  // Get current price for a ticket
  const getCurrentPrice = (ticket: Ticket): number => {
    return isDiscounted(ticket) ? ticket.discountPrice : ticket.price;
  };

  return (
    <Grid container spacing={3}>
      {tickets.map((ticket) => {
        const discounted = isDiscounted(ticket);
        const price = getCurrentPrice(ticket);
        const isSelected = selectedTicketId === ticket._id;
        
        return (
          <Grid item xs={12} md={4} key={ticket._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                border: isSelected ? '2px solid #FF6B6B' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: isSelected 
                  ? alpha(theme.palette.primary.main, 0.1) 
                  : 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
                  border: '2px solid #FF6B6B',
                },
              }}
              onClick={() => {
                console.log('Raw ticket object:', JSON.stringify(ticket));
                console.log('Raw ticket._id:', ticket._id, 'Type:', typeof ticket._id);
                console.log('All ticket properties:', Object.keys(ticket));
                
                // Validate ticket ID before creating validated ticket
                if (!ticket._id) {
                  console.error('Ticket missing _id property:', ticket);
                  return;
                }
                
                // Create a clean copy of the ticket with validated data
                const validatedTicket = {
                  ...ticket,
                  _id: String(ticket._id || '').trim(),
                  price: Number(ticket.price),
                  discountPrice: Number(ticket.discountPrice),
                  features: Array.isArray(ticket.features) ? [...ticket.features] : []
                };
                
                console.log('Validated ticket:', JSON.stringify(validatedTicket));
                console.log('Validated ticket ID:', validatedTicket._id, 'Type:', typeof validatedTicket._id);
                
                if (!validatedTicket._id) {
                  console.error('Warning: Empty ticket ID after validation');
                  return;
                }
                
                onSelectTicket(validatedTicket);
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: isSelected ? '#FF6B6B' : 'white',
                  }}
                >
                  {ticket.name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {discounted && (
                    <Typography 
                      variant="body2" 
                      color="error"
                      sx={{ 
                        textDecoration: 'line-through',
                        display: 'inline-block',
                        mr: 1
                      }}
                    >
                      GHS {ticket.price.toFixed(2)}
                    </Typography>
                  )}
                  
                  <Typography 
                    variant="h6" 
                    component="span"
                    sx={{ 
                      fontWeight: 'bold',
                      color: discounted ? 'success.main' : 'white'
                    }}
                  >
                    GHS {price.toFixed(2)}
                  </Typography>
                  
                  {discounted && (
                    <Chip 
                      size="small" 
                      color="error" 
                      label={`Save ${Math.round((ticket.price - ticket.discountPrice) / ticket.price * 100)}%`}
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {ticket.description}
                </Typography>
                
                <Stack spacing={1}>
                  {(ticket.features || []).map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ fontSize: 18, mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Stack>
                
                {discounted && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                    <Typography variant="caption" color="warning.main">
                      Early bird ends: {new Date(ticket.discountEndTime).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  fullWidth
                  variant={isSelected ? "contained" : "outlined"}
                  color={isSelected ? "primary" : "inherit"}
                  size="large"
                >
                  {isSelected ? "Selected" : "Select"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TicketSelection; 