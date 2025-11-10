import React, { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { BrandTheme } from "@/types/brand";

interface BrandThemeContextType {
  theme: BrandTheme | null;
}

const BrandThemeContext = createContext<BrandThemeContextType>({
  theme: null,
});

export function BrandThemeProvider({
  children,
  theme,
}: {
  children: ReactNode;
  theme?: BrandTheme | null;
}) {
  const prevTheme = useRef<BrandTheme | null>(null);

  useEffect(() => {
    if (!theme) return;

    // Only update if values changed
    if (prevTheme.current?.primaryColor !== theme.primaryColor) {
      document.documentElement.style.setProperty(
        "--brand-primary",
        theme.primaryColor
      );
    }

    if (prevTheme.current?.secondaryColor !== theme.secondaryColor) {
      document.documentElement.style.setProperty(
        "--brand-secondary",
        theme.secondaryColor
      );
    }

    if (prevTheme.current?.textColor !== theme.textColor) {
      document.documentElement.style.setProperty(
        "--brand-text",
        theme.textColor
      );
    }

    if (prevTheme.current?.primaryFont !== theme.primaryFont) {
      document.documentElement.style.setProperty(
        "--brand-primary-font",
        `'${theme.primaryFont}', sans-serif`
      );
    }

    if (prevTheme.current?.secondaryFont !== theme.secondaryFont) {
      document.documentElement.style.setProperty(
        "--brand-secondary-font",
        `'${theme.secondaryFont}', sans-serif`
      );
    }

    // Load Google Fonts dynamically
    if (prevTheme.current?.primaryFont !== theme.primaryFont) {
      const primaryFontLink = document.createElement("link");
      primaryFontLink.href = `https://fonts.googleapis.com/css2?family=${theme.primaryFont.replace(
        / /g,
        "+"
      )}:wght@300;400;500;700&display=swap`;
      primaryFontLink.rel = "stylesheet";
      document.head.appendChild(primaryFontLink);
    }

    if (
      theme.primaryFont !== theme.secondaryFont &&
      prevTheme.current?.secondaryFont !== theme.secondaryFont
    ) {
      const secondaryFontLink = document.createElement("link");
      secondaryFontLink.href = `https://fonts.googleapis.com/css2?family=${theme.secondaryFont.replace(
        / /g,
        "+"
      )}:wght@300;400;500;700&display=swap`;
      secondaryFontLink.rel = "stylesheet";
      document.head.appendChild(secondaryFontLink);
    }

    // Update favicon
    if (theme.faviconUrl && prevTheme.current?.faviconUrl !== theme.faviconUrl) {
      let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = theme.faviconUrl;
    }

    // Update meta tags for social sharing
    if (theme.shareImageUrl && prevTheme.current?.shareImageUrl !== theme.shareImageUrl) {
      let metaOG = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
      if (!metaOG) {
        metaOG = document.createElement("meta");
        metaOG.setAttribute("property", "og:image");
        document.head.appendChild(metaOG);
      }
      metaOG.setAttribute("content", theme.shareImageUrl);

      let metaTwitter = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
      if (!metaTwitter) {
        metaTwitter = document.createElement("meta");
        metaTwitter.setAttribute("name", "twitter:image");
        document.head.appendChild(metaTwitter);
      }
      metaTwitter.setAttribute("content", theme.shareImageUrl);
    }

    prevTheme.current = theme;
  }, [theme]);

  return (
    <BrandThemeContext.Provider value={{ theme: theme || null }}>
      {children}
    </BrandThemeContext.Provider>
  );
}

export const useBrandTheme = () => useContext(BrandThemeContext);
