import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import path from "node:path";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Reactive DOT",
  tagline: "A reactive library for building Substrate front-ends",
  favicon: "img/favicon.ico",

  url: "https://reactivedot.dev",
  baseUrl: "/",

  organizationName: "tien",
  projectName: "reactive-dot",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      "typedoc-api",
      {
        projectRoot: path.join(__dirname, "../.."),
        tsconfigName: "tsconfig.typedoc.json",
        packages: ["packages/core", "packages/react"],
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/tien/reactive-dot/tree/main/apps/docs",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.svg",
    navbar: {
      title: "Reactive DOT",
      logo: {
        alt: "Reactive DOT logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          label: "Docs",
        },
        {
          to: "api",
          label: "API",
        },
        {
          href: "https://github.com/tien/reactive-dot",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Made with a literal 💻 by <a href="https://tien.zone/" target="_blanck">Tiến</a>`,
    },
    prism: {
      additionalLanguages: ["bash"],
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
