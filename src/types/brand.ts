export interface BrandSettings {
  id: string;
  user_id: string;
  primary_color: string;    // HSL format: "217 91% 60%"
  secondary_color: string;
  text_color: string;
  primary_font: string;
  secondary_font: string;
  favicon_url?: string;
  share_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandTheme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  primaryFont: string;
  secondaryFont: string;
  faviconUrl?: string;
  shareImageUrl?: string;
}

export interface BrandPreset {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    name: "Ocean",
    description: "Blues & Teals",
    colors: {
      primary: "199 89% 48%",
      secondary: "217 91% 60%",
      text: "222.2 84% 4.9%",
    },
    fonts: { primary: "Montserrat", secondary: "Open Sans" },
  },
  {
    name: "Forest",
    description: "Natural Greens",
    colors: {
      primary: "142 76% 36%",
      secondary: "142 71% 45%",
      text: "215.3 25% 26.7%",
    },
    fonts: { primary: "Poppins", secondary: "Inter" },
  },
  {
    name: "Sunset",
    description: "Warm tones",
    colors: {
      primary: "20 90% 48%",
      secondary: "0 72% 51%",
      text: "24 9.8% 10%",
    },
    fonts: { primary: "Playfair Display", secondary: "Lora" },
  },
  {
    name: "Lavender",
    description: "Purples",
    colors: {
      primary: "271 81% 56%",
      secondary: "258 90% 66%",
      text: "244 47% 20%",
    },
    fonts: { primary: "Raleway", secondary: "Nunito" },
  },
  {
    name: "Minimal",
    description: "Monochrome",
    colors: {
      primary: "0 0% 9%",
      secondary: "0 0% 32%",
      text: "0 0% 4%",
    },
    fonts: { primary: "Inter", secondary: "Inter" },
  },
  {
    name: "Eco-Friendly",
    description: "Natural tones",
    colors: {
      primary: "82 78% 55%",
      secondary: "82 61% 50%",
      text: "83 78% 17%",
    },
    fonts: { primary: "Quicksand", secondary: "Work Sans" },
  },
];

export const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Lora",
  "Raleway",
  "Nunito",
  "Work Sans",
  "Quicksand",
  "Merriweather",
  "Rubik",
  "Source Sans Pro",
];
