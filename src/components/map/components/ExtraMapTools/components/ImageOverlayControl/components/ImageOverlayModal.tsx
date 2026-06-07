import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  useTheme,
} from "@mui/material";
import { useState } from "react";

const ImageOverlayModal = ({ open, onClose, onSubmit }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const theme = useTheme();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file); // Convert image to Base64 Data URL
    }
  };

  const handleSubmit = () => {
    if (imageSrc && lat && lng) {
      onSubmit({
        src: imageSrc,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        scale: 1, // Default scale multiplier
        rotation: 0, // Default rotation in degrees
        opacity: 0.8, // Default opacity
      });
      // Reset form on submit
      setImageSrc(null);
      setLat("");
      setLng("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: "text.secondary" }}>
        Add Image Overlay
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Button variant="outlined" component="label">
            Upload Photo (JPG, PNG)
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {imageSrc && (
            <Box
              component="img"
              src={imageSrc}
              sx={{ maxHeight: 150, objectFit: "contain", borderRadius: 1 }}
            />
          )}

          <TextField
            label="Latitude"
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            fullWidth
            placeholder="e.g. 35.6892"
          />
          <TextField
            label="Longitude"
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            fullWidth
            placeholder="e.g. 51.3890"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!imageSrc || !lat || !lng}
          sx={{
            "&.Mui-disabled": {
              backgroundColor: theme.palette.grey.A100,
              color: theme.palette.text.secondary,
            },
          }}
        >
          Add to Map
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageOverlayModal;
