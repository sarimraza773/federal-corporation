import React from 'react';
import Seo from '../components/Seo.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Section from '../components/Section.jsx';
import Card from '../components/Card.jsx';
import ReviewsFeature from '../components/ReviewsFeature.jsx';
import LatestNews from '../components/LatestNews.jsx';

export default function Home() {
  return (
    <>
      <Seo
        title="FederalCorporation Legal Services"
        description="Delivering trusted counsel and practical legal support across property and real estate conveyance, taxation, corporate, and non-profit matters."
      />

      <HeroCarousel />

      <Section title="A modern legal practice built on trust.">
        <div className="home-card-grid mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Practice Areas" subtitle="Clear expertise across core matters" href="/services">
            Explore services across property and real estate conveyance, taxation, corporate, intellectual property,
            anti-money laundering, and competition law.
          </Card>
          <Card title="Team" subtitle="Our professionals" href="/team">
            Meet the attorneys and staff who bring decades of experience and dedication to the firm.
          </Card>
          <Card title="Contact" subtitle="Reach us for inquiries" href="/contact">
            Use the contact page to send a message and find the listed office location.
          </Card>
        </div>
      </Section>

      <LatestNews />

      <Section className="reviews-section mt-10">
        <ReviewsFeature />
      </Section>

      <div className="h-8" />
    </>
  );
}
