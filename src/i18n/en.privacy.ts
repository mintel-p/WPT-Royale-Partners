/**
 * The text of the Privacy Policy page: part of the default dictionary as `privacy.sections`. Taken word by word
 * from the client's PDF ("WPT Royale Affiliates - Privacy Policy (Ontario).docx.pdf", 5 pages): bold, bullets and
 * the table of section 2 follow the PDF; the site address and the e-mail are links (as on the Terms page).
 * The same blocks and inline markup as the Terms page (src/i18n/en.terms.ts); the table's caption is the section
 * title (screen readers only, the PDF has none).
 */
import type { TermsSection } from './en.terms';

const sections: TermsSection[] = [
  {
    id: 'who-we-are-and-what-this-policy-covers',
    level: 2,
    toc: true,
    title: '1. Who we are and what this Policy covers',
    blocks: [
      'This policy explains how WPT Royale (“**we**”, “**us**”, “**our**”) collects, uses, discloses and protects personal information about affiliates and their representatives (“**you**”) in connection with the WPT Royale affiliate program (the “**Affiliate Program**”) and the website [www.wptroyalepartners.com](https://www.wptroyalepartners.com) (the “**Affiliate Site**”).',
      'We are registered with the Alcohol and Gaming Commission of Ontario (AGCO) and operate the WPT Royale online gaming site in Ontario under an operating agreement with iGaming Ontario (iGO).',
      'This policy applies to the Affiliate Program only. Personal information of players who register on the WPT Royale gaming site is handled under the WPT Royale player privacy policy. This policy should be read together with the Affiliate Program Terms and Conditions. Words with capital letters that are not defined here have the meaning given in those Terms and Conditions.',
    ],
  },
  {
    id: 'personal-information-we-collect',
    level: 2,
    toc: true,
    title: '2. Personal Information we collect',
    blocks: [
      'We collect only the personal information we need to run the Affiliate Program. This may include:',
      {
        table: {
          caption: 'Personal Information we collect',
          head: ['Category', 'Examples', 'Where it comes from'],
          rows: [
            [
              'Identity and contact details',
              'Name, company name, job title, email, phone number, postal address',
              'You, through the Application Form or Affiliate Account',
            ],
            [
              'Verification and compliance',
              'Government ID, proof of address, corporate documents, beneficial owners, AGCO registration details',
              'You, and public or regulatory registers',
            ],
            ['Payment and tax', 'Bank or payment account details, invoices, tax or business numbers', 'You'],
            [
              'Account and performance',
              'Login details, Tracking Links, referral statistics, commission and payment history',
              'Our affiliate platform',
            ],
            [
              'Marketing activity',
              'Your Affiliate Sites, marketing materials and channels',
              'You, and our compliance reviews',
            ],
            [
              'Technical',
              'IP address, browser and device data, pages visited on the Affiliate Site',
              'Cookies and similar technologies (see section 10)',
            ],
            ['Communications', 'Emails, chats and other messages with our team', 'You'],
          ],
        },
      },
      'The reports we make available to you show referred players by anonymous ID only. We do not share player names, contact details or payment information with affiliates.',
    ],
  },
  {
    id: 'how-we-use-your-personal-information',
    level: 2,
    toc: true,
    title: '3. How we use your Personal Information',
    blocks: [
      'We use your personal information to:',
      {
        clauses: [
          'review your application and verify your identity, ownership and suitability;',
          'set up and manage your Affiliate Account, Tracking Links and reports;',
          'calculate and pay commissions and keep financial and tax records;',
          'check that your marketing complies with the Terms and Conditions, the AGCO’s Registrar’s Standards for Internet Gaming and other applicable laws;',
          'detect, investigate and prevent fraud, money laundering and other misuse;',
          'communicate with you about the Affiliate Program, including service and compliance notices;',
          'send you program news and offers, where you have consented (see section 11);',
          'improve the Affiliate Site and the Affiliate Program; and',
          'meet our legal and regulatory obligations, and establish, exercise or defend legal claims.',
        ],
      },
      'We will not use your personal information for a new purpose without telling you first and, where required, getting your consent.',
    ],
  },
  {
    id: 'consent',
    level: 2,
    toc: true,
    title: '4. Consent',
    blocks: [
      'By applying to the Affiliate Program, you consent to us collecting, using and disclosing your personal information as described in this policy. Where the information is sensitive, such as identity documents or bank details, we will ask for your express consent.',
      'You may withdraw your consent at any time by contacting us (see section 12), subject to legal or contractual restrictions and reasonable notice. If you withdraw consent to information we need to run your account or pay you, we may no longer be able to keep you in the Affiliate Program.',
      'We may collect, use or disclose personal information without consent only where Canadian law permits or requires it, for example to investigate fraud or to comply with a legal order.',
      'If you give us personal information about another person, such as an employee or a beneficial owner, you confirm that you have their consent to do so.',
    ],
  },
  {
    id: 'who-we-share-it-with',
    level: 2,
    toc: true,
    title: '5. Who we share it with',
    blocks: [
      'We do not sell your personal information. We share it only as follows:',
      {
        clauses: [
          '**Our group companies and brand licensor**, to run and oversee the Affiliate Program.',
          '**Service providers** who act for us, such as our affiliate tracking platform, hosting and IT providers, payment providers and banks, identity verification providers, and professional advisers and auditors. They may use your information only to provide services to us, under contracts that require them to protect it.',
          '**Regulators and authorities**, including the AGCO and iGO, when we must or are permitted to by law, for example during an audit, inquiry or compliance review of our marketing affiliates.',
          '**Law enforcement, courts and other authorities**, where required by law, court order or legal process, or to protect our rights, players or the public, including to prevent fraud.',
          '**A buyer or successor**, if all or part of our business is sold, merged or restructured, under appropriate confidentiality terms.',
        ],
      },
      'Any other sharing will happen only with your consent.',
    ],
  },
  {
    id: 'storage-and-transfers-outside-canada',
    level: 2,
    toc: true,
    title: '6. Storage and Transfers outside Canada',
    blocks: [
      'Some of our group companies and service providers are located outside Canada, including the European Union. Your personal information may therefore be stored or processed in those countries.',
      'When we transfer it, we use contracts and other measures so that it receives protection comparable to the protection it would have in Canada. While it is outside Canada, it may be subject to the laws of that country and accessible to its courts, law enforcement and national security authorities.',
    ],
  },
  {
    id: 'how-long-we-keep-it',
    level: 2,
    toc: true,
    title: '7. How long we keep it',
    blocks: [
      'We keep your personal information for as long as you take part in the Affiliate Program and afterwards for as long as we need it for the purposes in section 3. In general this is five “5” years after your account closes, so that we can meet our tax, accounting and AGCO record-keeping obligations and deal with any claims.',
      'When we no longer need it, we securely destroy it or make it anonymous. If we used your information to make a decision about you, we keep it long enough for you to request access to it.',
    ],
  },
  {
    id: 'security',
    level: 2,
    toc: true,
    title: '8. Security',
    blocks: [
      'We protect your personal information with physical, organisational and technical safeguards suited to its sensitivity. These include access controls, encryption, staff confidentiality obligations and limited access on a need-to-know basis.',
      'If a breach of security safeguards involving your personal information creates a real risk of significant harm to you, we will notify you and the Office of the Privacy Commissioner of Canada as required by law.',
      'You are responsible for keeping your Affiliate Account login details confidential. Tell us straight away if you believe your account has been accessed without permission.',
    ],
  },
  {
    id: 'your-rights-and-how-to-complain',
    level: 2,
    toc: true,
    title: '9. Your Rights and how to Complain',
    blocks: [
      'You have the right to:',
      {
        clauses: [
          'ask whether we hold personal information about you, and get access to it;',
          'ask how we have used it and to whom we have disclosed it;',
          'ask us to correct it if it is inaccurate or incomplete; and',
          'withdraw your consent, as described in section 4.',
        ],
      },
      'Send your request in writing to the contact in section 12. We may need to verify your identity first. We will reply within 30 days, or tell you within that time if we need more time and why. If we cannot give you access to some information, we will explain why, unless the law prevents us.',
      'If you are not satisfied with how we handle your request or your personal information, please contact us first. You also have the right to complain to the Office of the Privacy Commissioner of Canada.',
    ],
  },
  {
    id: 'cookies-and-tracking',
    level: 2,
    toc: true,
    title: '10. Cookies and Tracking',
    blocks: [
      'The Affiliate Site uses cookies and similar technologies to keep you signed in, keep the site secure, remember your preferences and understand how the site is used.',
      'Our tracking platform also uses cookies on the WPT Royale gaming site to record which affiliate referred each player, so that we can calculate your commission. Those cookies are covered by the WPT Royale player privacy policy.',
      'You can block or delete cookies in your browser settings. If you block the essential ones, parts of the Affiliate Site, such as signing in, may not work.',
    ],
  },
  {
    id: 'electronic-messages-and-your-own-data-handling',
    level: 2,
    toc: true,
    title: '11. Electronic Messages and your own Data Handling',
    blocks: [
      'We send service and compliance messages about your Affiliate Account as part of the Affiliate Program. We send promotional messages, such as program news and offers, only where we have your consent under Canada’s Anti-Spam Legislation (CASL). Every promotional message includes an unsubscribe link, and we act on unsubscribe requests within 10 business days.',
      'If you collect personal information from people you later refer to us, you are responsible for doing so lawfully, including getting any consent required under PIPEDA and CASL. Your obligations for this are set out in the Terms and Conditions.',
    ],
  },
  {
    id: 'changes-to-this-policy-and-how-to-contact-us',
    level: 2,
    toc: true,
    title: '12. Changes to this Policy and how to Contact us',
    blocks: [
      'We may update this policy from time to time. We will post the updated version on the Affiliate Site with a new “last updated” date and, for significant changes, notify you by email or through your Affiliate Account.',
      'Our Privacy Officer is responsible for our compliance with this policy. For questions, requests or complaints, contact us here [affiliate@wptroyalepartners.com](mailto:affiliate@wptroyalepartners.com).',
      'Last updated 27 November 2026',
    ],
  },
];

export default sections;
