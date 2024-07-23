import styles from "./styles.module.css";
import Heading from "@theme/Heading";
import { ReactNode } from "react";

type SponsorItem = {
  title: string;
  image: ReactNode;
  href: string;
};

const SponsorList: SponsorItem[] = [
  {
    title: "Polkadot OpenGov",
    image: (
      <svg viewBox="0 0 144.09077 39.600665">
        <g
          transform="matrix(0.01976877,0,0,0.01976877,-0.139045,0.0520228)"
          style={{ fill: `#e6007a` }}
        >
          <ellipse
            className="cls-1"
            cx="1000"
            cy="441.78"
            rx="254.27"
            ry="147.95"
          />
          <ellipse
            className="cls-1"
            cx="1000"
            cy="1556.15"
            rx="254.27"
            ry="147.95"
          />
          <ellipse
            className="cls-1"
            cx="517.46997"
            cy="720.38"
            rx="254.27"
            ry="147.95"
            transform="rotate(-60,517.46931,720.37686)"
          />
          <ellipse
            className="cls-1"
            cx="1482.53"
            cy="1277.5601"
            rx="254.27"
            ry="147.95"
            transform="rotate(-60,1482.5334,1277.5569)"
          />
          <ellipse
            className="cls-1"
            cx="517.46997"
            cy="1277.5601"
            rx="147.95"
            ry="254.27"
            transform="rotate(-30,517.46066,1277.5532)"
          />
          <ellipse
            className="cls-1"
            cx="1482.53"
            cy="720.38"
            rx="147.95"
            ry="254.27"
            transform="rotate(-30,1482.5338,720.38372)"
          />
        </g>
        <text
          xmlSpace="preserve"
          style={{
            fill: "currentcolor",
            fontFamily: "Unbounded",
            fontSize: 186.667,
            fontWeight: 500,
            fontStyle: "oblique 11deg",
          }}
          transform="matrix(0.09464894,0,0,0.09464894,-123.10569,-7.9919671)"
        >
          <tspan x="1695.6562" y="364.89008">
            OpenGov
          </tspan>
        </text>
      </svg>
    ),
    href: "https://polkadot.network/features/opengov",
  },
];

function Sponsor({ title, image, href }: SponsorItem) {
  return (
    <a href={href} target="_blank" className={styles.sponsor}>
      <figure>
        {image}
        <figcaption>{title}</figcaption>
      </figure>
    </a>
  );
}

export function HomepageSponsors() {
  return (
    <section className="margin-vert--lg">
      <header className="text--center">
        <Heading as="h2" className="text--primary">
          Sponsored by
        </Heading>
      </header>
      <div className={styles.sponsors}>
        {SponsorList.map((props, index) => (
          <Sponsor key={index} {...props} />
        ))}
      </div>
    </section>
  );
}
