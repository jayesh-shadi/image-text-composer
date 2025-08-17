import WebFont from "webfontloader";

export const DEFAULT_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Montserrat",
  "Oswald",
  "Source Sans 3",
  "Merriweather",
  "Nunito",
  "Raleway",
  "Playfair Display",
  "Rubik",
  "Work Sans",
  "Ubuntu",
  "DM Sans",
  "Fira Sans",
  "Karla"
];

export function loadFonts(families: string[]) {
  WebFont.load({
    google: {
      families: families.map((f) => `${f}:100,200,300,400,500,600,700,800,900`)
    }
  });
}
