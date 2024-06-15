import styles from "./index.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import sdk from "@stackblitz/sdk";
import Layout from "@theme/Layout";
import { useEffect, useRef } from "react";

export default function Try() {
  const ref = useRef<HTMLDivElement>();
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    sdk.embedGithubProject(
      ref.current,
      `${siteConfig.organizationName}/${siteConfig.projectName}/tree/feat/playground/playground`,
      {
        openFile: "src/Playground.tsx",
      },
    );
  }, []);

  return (
    <Layout noFooter>
      <div ref={ref} className={styles.editor} />
    </Layout>
  );
}
