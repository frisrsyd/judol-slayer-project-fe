import styles from "@/styles/Home.module.css";
import { Instagram } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Box
        component={"a"}
        href="https://saweria.co/frisrsyd"
        target="_blank"
        display={"flex"}
        justifyContent={{ xs: "center", md: "start" }}
        alignItems={"center"}
        flexDirection={"row"}
        width={350}
        height={50}
        pl={{ xs: 0, md: 2 }}
        mr={{ xs: 0, md: "auto" }}
      >
        <Image src="/saweria.png" alt="frisrsyd" width={100} height={50} />
        <Typography
          sx={{
            color: "white",
          }}
        >
          Support me on Saweria
        </Typography>
      </Box>
      <Box
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"row"}
        minWidth={"fit-content"}
        // width={"80%"}
        position={{ xs: "relative", md: "absolute" }}
        sx={{
          textAlign: { xs: "start", md: "center" },
        }}
      >
        <Typography sx={{ color: "white", mr: 0.5 }}>
          &copy; {new Date().getFullYear()} Judol Slayer by
        </Typography>
        <Typography
          component="a"
          color="info"
          href="https://instagram.com/frisrsyd/"
          target="_blank"
          sx={{ display: "inline" }}
        >
          <Instagram />
          frisrsyd
        </Typography>
      </Box>
      <Box
        component={"a"}
        href="https://ko-fi.com/frisrsyd"
        target="_blank"
        display={"flex"}
        justifyContent={{ xs: "center", md: "end" }}
        alignItems={"center"}
        flexDirection={"row"}
        width={250}
        height={50}
        pr={{ xs: 0, md: 2 }}
        ml={{ xs: 0, md: "auto" }}
      >
        <Image src="/ko-fi-banner.png" alt="frisrsyd" width={250} height={50} />
      </Box>
    </footer>
  );
}
