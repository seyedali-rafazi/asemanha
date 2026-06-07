import { Box, Typography } from "@mui/material";

const LatCoordinate = ({ coords }) => {
  return (
    <>
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: 10,
          fontWeight: "bold",
        }}
      >
        Lat
      </Typography>
      <Box>
        <Typography
          sx={{
            minWidth: "70px",
            color: "text.secondary",
            textAlign: "center",
            fontSize: "10px",
          }}
        >
          {coords ? coords.lat : "-"}
        </Typography>
      </Box>
    </>
  );
};

export default LatCoordinate;
