export const services = [
  {
    slug: 'real-estate-conveyance',
    title: 'Property & Real Estate',
    fullTitle: 'Property / Real Estate Conveyance',
    subtitle: 'Transactions & documentation',
    text: 'Support on property documentation, conveyance, and transactional execution.',
    summary:
      'Our conveyance practice supports property transfers, title documentation, due diligence, and transaction execution.',
    points: [
      'Sale deeds, transfer documents, lease documentation, and property papers.',
      'Title review, verification support, and transactional due diligence.',
      'Coordination through execution, filing, and procedural requirements.',
    ],
  },
  {
    slug: 'taxation',
    title: 'Taxation',
    fullTitle: 'Taxation (Direct and Indirect)',
    subtitle: 'Tax Filing, Advisory & Litigation',
    text: 'Tax planning, compliance guidance, and support on tax-related disputes and filings.',
    summary:
      'We assist clients with direct and indirect tax matters, from everyday compliance to strategic planning and Dispute Resolution.',
    points: [
      'Tax registration, filing guidance, and procedural compliance.',
      'Advisory support for individuals, businesses, trusts, and organisations.',
      'Representation and documentation support in tax notices, assessments, and disputes.',
    ],
  },
  {
    slug: 'non-profit-organisations',
    title: 'NonProfit Organisation',
    fullTitle: 'Non-Profit Organisations',
    subtitle: 'Advisory & representation',
    text: 'Charities, trusts, funds, and voluntary social welfare matters.',
    summary:
      'We support non-profit bodies with structure, registration, compliance, governance, and documentation.',
    points: [
      'Registration and documentation for charities, trusts, funds, and welfare bodies.',
      'Governance, reporting, and regulatory compliance guidance.',
      'Advisory support for charitable operations, boards, and donor-facing documentation.',
    ],
  },
  {
    slug: 'anti-money-laundering',
    title: 'Anti Money Laundering',
    fullTitle: 'Anti Money Laundering & Anti-Benami (Proxy)',
    subtitle: 'Protecting institutions, preserving integrity',
    text: 'Ensuring integrity and transparency in local finance.',
    summary:
      'We advise on compliance and documentation for matters involving financial transparency, beneficial ownership, and risk controls.',
    points: [
      'AML and anti-benami compliance guidance for businesses and institutions.',
      'Documentation review for ownership, control, and transaction transparency.',
      'Support in responding to notices, inquiries, and procedural requirements.',
    ],
  },
  {
    slug: 'corporate',
    title: 'Corporate and Commercial',
    fullTitle: 'Corporate & Commercial',
    aboutTitle: 'Corporate and Commercial',
    subtitle: 'Company Incorporation, Regulatory, and Compliance Matters',
    text: 'Corporate structuring, governance, contracts, and commercial advisory.',
    summary:
      'Our corporate practice helps clients structure, operate, document, and grow their businesses with clear legal support.',
    points: [
      'Company incorporation, restructuring, and governance documentation.',
      'Commercial contracts, board resolutions, and shareholder arrangements.',
      'Business registration, advisory, and recurring compliance support.',
    ],
  },
  {
    slug: 'intellectual-property',
    title: 'Intellectual Property',
    fullTitle: 'Intellectual Property',
    subtitle: 'Protecting valuable rights',
    text: 'IP strategy support across trademarks/copyright and related matters.',
    summary:
      'We help clients identify, document, protect, and manage intellectual property rights.',
    points: [
      'Trademark and copyright registration.',
      'IP documentation, assignments, licensing, and portfolio support.',
      'Advisory support for brand protection and rights enforcement.',
    ],
  },
  {
    slug: 'competition-law',
    title: 'Competition Law',
    fullTitle: 'Competition Law (Antitrust & Monopolies)',
    subtitle: 'Competition-facing issues',
    text: 'Guidance on antitrust/competition concerns and related advisory needs.',
    summary:
      'We provide advisory support for clients navigating competition, monopoly, and market conduct issues.',
    points: [
      'Competition compliance guidance and commercial risk review.',
      'Advisory support for business practices, agreements, and market conduct.',
      'Documentation and response support for regulatory inquiries.',
    ],
  },
];

const featuredServiceSlugs = new Set([
  'real-estate-conveyance',
  'taxation',
  'corporate',
  'non-profit-organisations',
]);

export const featuredServices = services
  .filter((service) => featuredServiceSlugs.has(service.slug))
  .map((service) => service.slug);

export function getServiceBySlug(slug) {
  return services.find((service) => service.slug === slug);
}
