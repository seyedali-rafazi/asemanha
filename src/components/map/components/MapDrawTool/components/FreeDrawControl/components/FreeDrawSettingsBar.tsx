// src/components/ExpandableToolbar/components/DrawLineControl/LineSettingsBar.jsx
import { Box, Paper, Slider, TextField, Typography } from "@mui/material";

const FreeDrawSettingsBar = ({ lineColor, setLineColor, lineWidth, setLineWidth }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'absolute', 
        right: 60, 
        padding: 2, 
        width: 200, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        zIndex: 10
      }}
    >
      <Typography variant="subtitle2">Line Settings</Typography>
      
      <TextField
        label="Line Color"
        type="color"
        value={lineColor}
        onChange={(e) => setLineColor(e.target.value)}
        fullWidth
        size="small"
      />

      <Box>
        <Typography variant="caption" color="textSecondary">
          Thickness: {lineWidth}px
        </Typography>
        <Slider
          value={lineWidth}
          onChange={(e, newValue) => setLineWidth(newValue)}
          min={1}
          max={20}
          valueLabelDisplay="auto"
        />
      </Box>
    </Paper>
  );
};

export default FreeDrawSettingsBar;
