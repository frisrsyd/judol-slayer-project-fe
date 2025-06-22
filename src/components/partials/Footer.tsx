import styles from "@/styles/Home.module.css";
import { Web } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Box
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"row"}
        width={"100%"}
        position={{ xs: "relative", md: "absolute" }}
        sx={{
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "white" }}>
          &copy; {new Date().getFullYear()} Judol Slayer by
        </Typography>
        <Typography
          component="a"
          color="info"
          href="https://frisrsyd.github.io/Portfolio/"
          target="_blank"
          sx={{ display: "inline" }}
        >
          <Web />
          frisrsyd
        </Typography>
      </Box>
      <Box
        display={"flex"}
        justifyContent={{ xs: "center", sm: "end" }}
        alignItems={"center"}
        flexDirection={"row"}
        width={"100%"}
        pr={{ xs: 0, sm: 2 }}
      >
        <a href="https://ko-fi.com/frisrsyd">
          {" "}
          <Image
            src="/ko-fi-banner.png"
            alt="frisrsyd"
            width={250}
            height={50}
          />
        </a>
      </Box>
    </footer>
  );
}
