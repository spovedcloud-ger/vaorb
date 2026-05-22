export const ASSETS = {
  intro: 'https://www.annbuendia.com/ablanding/img/intro.png',
  business: 'https://www.annbuendia.com/ablanding/img/business/business-img.png',
  contact: 'https://www.annbuendia.com/ablanding/img/contact/01.png',
  favicon: 'https://www.annbuendia.com/ablanding/img/ab-favicon.png',
};

export const EXTERNAL_LINKS = {
  about: '/wp/about',
  getQuote: '/wp/get-started/?plans=Other-Service',

  hosting: 'https://vercel.com/domains',
  tools: 'https://annbuendia.com/go',
  learnMore: '/wp',
  zcal: 'https://zcal.co/i/bAG6PBro?embed=1&embedType=inline&embedVersion=1.0.2&embedDomain=annbuendia.com',
  emailPrimary: 'mailto:annbuendia023@gmail.com',
  emailHello: 'mailto:hello@annbuendia.com',
  linkedin: 'https://www.linkedin.com/in/ann~buendia/',
  youtube: 'https://www.youtube.com/@ann.buendia',
  instagram: 'https://www.instagram.com/annbuendia023/',
  facebook: 'https://www.facebook.com/annbuendia025',
  tarot: 'https://anskey.net/tarotai/',
};

export const getStartedUrl = (plan) =>
  `/wp/get-started/?plans=${encodeURIComponent(plan)}`;

export const DEFAULT_PRICING = [
  {
    planType: 'essential-orbit',
    title: 'Essential Orbit',
    price: 450,
    rateText: 'Flat fee / mo',
    period: 'month',
    featured: false,
    buyPlan: 'Essential',
    details: [
      '$400 - $500 USD per month',
      'Up to 15 hours a month capacity',
      'Handle basic admin tasks',
      'Track down up to 10 invoices',
      'Predictable monthly business expense',
      'Rewards efficiency',
    ],
  },
  {
    planType: 'total-operations',
    title: 'Total Operations',
    price: 900,
    rateText: 'Flat fee / mo',
    period: 'month',
    featured: true,
    buyPlan: 'Total Ops',
    details: [
      '$800 - $1,000 USD per month',
      'Up to 30 hours a month capacity',
      'Deeper admin tracking',
      'Cross-checking vendor payments',
      'Manage all overdue client accounts',
      'Rewards efficiency',
    ],
  },
  {
    planType: 'growth-orbit',
    title: 'Growth Orbit',
    price: 1250,
    rateText: 'Flat fee / mo',
    period: 'month',
    featured: false,
    buyPlan: 'Growth',
    details: [
      '$1,100 - $1,400 USD per month',
      'Up to 40 hours a month capacity',
      'Advanced admin support & follow-ups',
      'Inbox & calendar management',
      'CRM updates & workflow coordination',
      'Rewards efficiency',
    ],
  },
  {
    planType: 'single-landing-page',
    title: 'Single Landing Page Build',
    price: 600,
    priceSuffix: '+',
    period: 'one-time',
    featured: false,
    buyPlan: 'Single Page',
    details: [
      '$500 - $800 USD flat fee',
      'Design & Setup',
      'Copywriting',
      'Domain connection',
      'Perfect for standalone services',
    ],
  },
  {
    planType: 'full-multi-page',
    title: 'Full Multi-Page Website',
    price: 1500,
    priceSuffix: '+',
    period: 'one-time',
    featured: true,
    buyPlan: 'Multi-Page',
    details: [
      '$1,200 - $2,000+ USD flat fee',
      'Complete website build',
      'Pricing depends on pages & complexity',
      'Design & Setup',
      'Domain connection',
    ],
  },
  {
    planType: 'mern-custom-app',
    title: 'Custom Web Application',
    price: 3500,
    priceSuffix: '+',
    period: 'one-time',
    featured: false,
    buyPlan: 'Custom App',
    details: [
      '$3,000+ USD flat fee',
      'Custom web portals & dashboards',
      'Interactive, app-like experiences',
      'Secure user logins & accounts',
      'Advanced data & tailored features',
    ],
  },

  {
    planType: 'branding',
    title: 'Branding',
    price: 900,
    priceSuffix: '+',
    period: 'as-needed',
    featured: false,
    buyPlan: 'Branding',
    details: [
      '• starts at $900',
      '• as-needed',
      '• graphic design & illustration',
      '• logo, landing page, etc.',
    ],
  },
  {
    planType: 'marketing',
    title: 'Marketing',
    price: 1500,
    priceSuffix: '+',
    period: 'retainer',
    featured: true,
    buyPlan: 'Marketing',
    details: [
      '• starts at $1500',
      '• retainer (6-mo cycle)',
      '• smm: paid ads; FB, etc.',
      '• monthly campaign setup',
    ],
  },
  {
    planType: 'automation',
    title: 'Automation',
    price: 2500,
    priceSuffix: '+',
    period: 'one-time',
    featured: false,
    buyPlan: 'Automation',
    details: [
      '• starts at $2500',
      '• one-time',
      '• AI automation: chatbot, etc.',
      '• 1 tool creation and setup',
    ],
  },
];

export const PRICING_CATEGORIES = [
  { id: 'hourly', label: 'VA Services: Flat Monthly Retainer', anchor: 'rates' },
  { id: 'packages', label: 'Web Development', anchor: 'packages' },
  { id: 'other', label: 'Other Services', anchor: 'other' },
];

export const filterPricing = (pricing, category) => {
  const groups = {
    hourly: ['essential-orbit', 'total-operations', 'growth-orbit'],
    packages: ['single-landing-page', 'full-multi-page', 'mern-custom-app'],
    other: ['branding', 'marketing', 'automation'],
  };
  return pricing.filter((p) => groups[category]?.includes(p.planType));
};
