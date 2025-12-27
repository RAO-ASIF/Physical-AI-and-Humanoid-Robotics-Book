import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.textSection}>
            <Heading as="h1" className="hero__title">
              {siteConfig.title}
            </Heading>
            <p className={styles.heroSubtitle}>Physical AI & Humanoid Robotics</p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                START READING
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="https://github.com/panaverse/Physical-AI-and-Humanoid-Robotics-Book">
                Explore Project GitHub
              </Link>
            </div>
            <div className={styles.githubLink}>
              <Link to="https://github.com/panaverse/Physical-AI-and-Humanoid-Robotics-Book">
                // Open Source
              </Link>
            </div>
          </div>
          <div className={styles.visualSection}>
            <img
              src="img/hero-placeholder.svg"
              alt="Robotic Brain Illustration"
              className={styles.visualAsset}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
