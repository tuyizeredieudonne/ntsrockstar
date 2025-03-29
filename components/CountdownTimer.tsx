import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeBoxProps {
  value: number;
  label: string;
}

interface CountdownTimerProps {
  targetDate: Date;
}

const TimeBox: React.FC<TimeBoxProps> = ({ value, label }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 1.5, sm: 2 },
        textAlign: 'center',
        minWidth: { xs: 80, sm: 100 },
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="div" 
        fontWeight="bold"
        sx={{ 
          lineHeight: 1,
          mb: { xs: 0.5, sm: 1 }
        }}
      >
        {value.toString().padStart(2, '0')}
      </Typography>
      <Typography 
        variant={isMobile ? "caption" : "body2"} 
        sx={{ 
          display: 'block',
          opacity: 0.9
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const days = differenceInDays(targetDate, now);
      const hours = differenceInHours(targetDate, now) % 24;
      const minutes = differenceInMinutes(targetDate, now) % 60;
      const seconds = differenceInSeconds(targetDate, now) % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <Box sx={{ my: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" component="h2" gutterBottom textAlign="center">
        Event Starts In
      </Typography>
      <Grid container spacing={{ xs: 1, sm: 2 }} justifyContent="center">
        <Grid item>
          <TimeBox value={timeLeft.days} label="Days" />
        </Grid>
        <Grid item>
          <TimeBox value={timeLeft.hours} label="Hours" />
        </Grid>
        <Grid item>
          <TimeBox value={timeLeft.minutes} label="Minutes" />
        </Grid>
        <Grid item>
          <TimeBox value={timeLeft.seconds} label="Seconds" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CountdownTimer; 