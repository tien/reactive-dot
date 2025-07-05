import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import type { PluginOptions as LlmsTxtPluginOptions } from "@signalwire/docusaurus-plugin-llms-txt";
import path from "node:path";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "ReactiveDOT",
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

  presets: [
    [
      "classic",
      {
        docs: {
          path: "react",
          routeBasePath: "react",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/tien/reactive-dot/tree/main/apps/docs",
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "vue",
        path: "vue",
        routeBasePath: "vue",
        sidebarPath: "./sidebars.ts",
        editUrl: "https://github.com/tien/reactive-dot/tree/main/apps/docs",
        remarkPlugins: [
          [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
        ],
      },
    ],
    [
      "typedoc-api",
      {
        projectRoot: path.join(__dirname, "../.."),
        tsconfigName: "tsconfig.typedoc.json",
        packages: [
          {
            path: "packages/core",
            entry: {
              index: "src/index.ts",
              "wallets.js": { path: "src/wallets/index.ts", label: "Wallets" },
            },
          },
          "packages/react",
          "packages/vue",
          "packages/utils",
        ],
      },
    ],
    [
      "@signalwire/docusaurus-plugin-llms-txt",
      {
        depth: 2,
        content: { enableLlmsFullTxt: true },
      } satisfies LlmsTxtPluginOptions,
    ],
  ],

  themeConfig: {
    image: "img/social-card.png",
    navbar: {
      title: "ReactiveDOT",
      logo: {
        alt: "ReactiveDOT logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          label: "React",
        },
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          docsPluginId: "vue",
          label: "Vue",
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
