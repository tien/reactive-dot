import styles from "./styles.module.css";
import Heading from "@theme/Heading";
import clsx from "clsx";
import { ReactNode } from "react";

type FeatureItem = {
  title: ReactNode;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Performant & lightweight",
    emoji: "🚀",
    description: (
      <>
        Multiple reads of the same value throughout the application will only be
        fetched once, cached, and is kept up to date everywhere.
      </>
    ),
  },
  {
    title: "Full of Front-end love",
    emoji: "🖼️",
    description: (
      <>
        All values are reactive with React suspense being the first class
        citizen for async & error handling.
      </>
    ),
  },
  {
    title: (
      <span>
        Powered by{" "}
        <a href="https://papi.how/" target="_blank">
          Polkadot-API
        </a>
      </span>
    ),
    emoji: "🛠️",
    description: (
      <>
        The meticulously crafted suite of libraries, each designed to be
        composable, modular, and fundamentally aligned with a "light-client
        first" philosophy.
      </>
    ),
  },
];

function Feature({ title, emoji, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={clsx(styles.featureEmoji, "text--center")}>{emoji}</div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function HomepageFeatures() {
  return (
    <section className={clsx(styles.features, "margin-vert--lg")}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, index) => (
            <Feature key={index} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
