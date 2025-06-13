import React from 'react';
import { Modal, Box, Checkbox, FormControlLabel, Button } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface ChartCardModalProps {
  isOpen: boolean;
  chartCards: { id: string; title: string; visible: boolean }[];
  toggleVisibility: (id: string) => void;
  onClose: () => void;
}

export const ChartCardModal: React.FC<ChartCardModalProps> = ({
  isOpen,
  chartCards,
  toggleVisibility,
  onClose,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <h2>Customize Charts</h2>
        {chartCards.map((chart) => (
          <FormControlLabel
            key={chart.id}
            control={
              <Checkbox
                checked={chart.visible}
                onChange={() => toggleVisibility(chart.id)}
              />
            }
            label={chart.title}
          />
        ))}
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </Box>
    </Modal>
  );
};