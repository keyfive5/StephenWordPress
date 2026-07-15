'use client'

import Link from "next/link";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { useContext } from "react";
import config from '@/app/context/config'
import { CustomizerContext } from "@/app/context/customizerContext";

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '40px' : '180px',
    overflow: "hidden",
    display: "block",
  }));

  if (activeDir === "ltr") {
    return (
      <LinkStyled href="/">
        {activeMode === "dark" ? (
          <Image
          style={{marginTop:'8px'}}
            src="/images/logos/logo.jpg"
            alt="logo"
            height={TopbarHeight-22}
            width={126}
            priority
          />
        ) : (
          <Image
          style={{marginTop:'8px'}}
            src={"/images/logos/logo.jpg"}
            alt="logo"
            height={TopbarHeight-10}
            width={128}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      {activeMode === "dark" ? (
        <Image
          src="/images/logos/logo.jpg"
          alt="logo"
          height={TopbarHeight}
          width={174}
          priority
        />
      ) : (
        <Image
          src="/images/logos/logo.jpg"
          alt="logo"
          height={TopbarHeight}
          width={174}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
