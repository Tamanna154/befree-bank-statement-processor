import { TransactionCategory, TransactionMode } from '../types';

export interface HeuristicRuleMatch {
  category: TransactionCategory;
  confidence: number; // 0.85 to 1.00
  ruleName: string;
  explanation: string;
}

interface HeuristicPattern {
  name: string;
  category: TransactionCategory;
  pattern: RegExp;
  creditOnly?: boolean;
  debitOnly?: boolean;
  confidence: number;
  explanation: string;
}

const HEURISTIC_PATTERNS: HeuristicPattern[] = [
  // 1. Salary & Income
  {
    name: "Salary Credit Narration",
    category: "Salary & Income",
    pattern: /\b(salary|sal\s*cr|payroll|monthly\s*sal|stipend|wages|direct\s*dep|bonus\s*pymt)\b/i,
    creditOnly: true,
    confidence: 0.99,
    explanation: "Detected payroll or salary credit keywords in inward transfer."
  },
  {
    name: "Dividend Credit",
    category: "Salary & Income",
    pattern: /\b(dividend|div\s*cr|incentive|remuneration)\b/i,
    creditOnly: true,
    confidence: 0.95,
    explanation: "Dividend or corporate earnings inward transfer detected."
  },

  // 2. Bank Charges & Interest
  {
    name: "Savings Interest Credit",
    category: "Bank Charges & Interest",
    pattern: /\b(int(?:erest)?(?:\.|\s*)(?:pd|paid|earned|cr)|savings\s*int|quarterly\s*int)\b/i,
    creditOnly: true,
    confidence: 0.98,
    explanation: "Quarterly savings bank interest credit detected."
  },
  {
    name: "Bank Charges & Levies",
    category: "Bank Charges & Interest",
    pattern: /\b(sms\s*chg|min(?:imum)?\s*bal|consolidated\s*chg|annual\s*fee|chq\s*return|gst\s*chg|debit\s*card\s*fee|service\s*charge)\b/i,
    debitOnly: true,
    confidence: 0.97,
    explanation: "Automated bank tariff, SMS maintenance, or minimum balance fee."
  },

  // 3. Cash & ATM
  {
    name: "ATM Cash Withdrawal",
    category: "Cash & ATM",
    pattern: /\b(atm\s*wdl|nfs\*atm|cash\s*wdl|atm\s*cash|cdm\s*cash|cash\s*withdrawal|atw|cwdr)\b/i,
    confidence: 0.99,
    explanation: "ATM terminal cash withdrawal or cash deposit machine transaction."
  },

  // 4. Food & Dining
  {
    name: "Food Delivery & Restaurants",
    category: "Food & Dining",
    pattern: /\b(swiggy|zomato|mcdonald'?s|domino'?s|starbucks|burger\s*king|kfc|pizza\s*hut|subway|barbeque\s*nation|chaayos|haldiram|cafe\s*coffee\s*day|blue\s*tokai|belgian\s*waffle|mainland\s*china|dunkin|baskin\s*robbins|restaurant|eats|bakery|biryani|dhaba)\b/i,
    confidence: 0.96,
    explanation: "Recognized leading food delivery aggregator, cafe, or restaurant chain."
  },

  // 5. Groceries & Supermarkets
  {
    name: "Quick Commerce & Groceries",
    category: "Groceries & Supermarket",
    pattern: /\b(blinkit|zepto|bigbasket|dmart|instamart|nature'?s\s*basket|grofers|spencer'?s|more\s*retail|reliance\s*fresh|kirana|supermarket|vegetable|provision\s*store|milk\s*basket|country\s*delight|otipy|bazaar)\b/i,
    confidence: 0.96,
    explanation: "Grocery delivery app, supermarket, or local dairy/vegetable vendor."
  },

  // 6. Shopping & E-Commerce
  {
    name: "E-Commerce & Retail Shopping",
    category: "Shopping & E-Commerce",
    pattern: /\b(amazon|flipkart|myntra|ajio|meesho|nykaa|tata\s*cliq|zara|h&m|decathlon|croma|reliance\s*digital|uniqlo|ikea|lifestyle|shoppers\s*stop|lenskart|westside|marks\s*and\s*spencer)\b/i,
    confidence: 0.95,
    explanation: "Major e-commerce platform or retail lifestyle/electronics brand."
  },

  // 7. Utilities & Bills
  {
    name: "Utility Bills & Telecom",
    category: "Utilities & Bills",
    pattern: /\b(bescom|tata\s*power|adani\s*electricity|airtel|jio|vodafone|vi\s*bill|act\s*fibernet|mahanagar\s*gas|igl|delhi\s*jal\s*board|tatasky|fastag|electricity\s*bill|water\s*bill|broadband|dth\s*recharge|bbps|discom|postpaid)\b/i,
    confidence: 0.97,
    explanation: "Electricity, piped gas, water board, mobile recharge, or FASTag toll."
  },

  // 8. Travel & Transportation
  {
    name: "Rides, Flights & Fuel",
    category: "Travel & Transportation",
    pattern: /\b(uber|ola\s*cabs|rapido|irctc|indian\s*railways|makemytrip|goibibo|indigo|air\s*india|vistara|metro|petrol|diesel|fuel|shell|bpcl|hpcl|iocl|red\s*bus|yatra|cleartrip)\b/i,
    confidence: 0.95,
    explanation: "Cab ride, airline ticket, railways, metro, or fuel pump payment."
  },

  // 9. Health & Medical
  {
    name: "Healthcare & Pharmacy",
    category: "Health & Medical",
    pattern: /\b(apollo\s*pharmacy|pharmeasy|1mg|medplus|netmeds|hospital|clinic|pathlab|lal\s*pathlabs|metropolis|diagnostic|dental|healthcare|practo|pharmacy|chemist)\b/i,
    confidence: 0.96,
    explanation: "Hospital, clinical lab test, dental appointment, or pharmacy order."
  },

  // 10. Entertainment & Subscriptions
  {
    name: "Streaming & Movies",
    category: "Entertainment & Subscriptions",
    pattern: /\b(netflix|spotify|hotstar|disney\+|youtube\s*premium|prime\s*video|apple\.com\/bill|itunes|google\s*play|bookmyshow|pvr|inox|sonyliv|zee5|audible|playstation|steam\s*games)\b/i,
    confidence: 0.98,
    explanation: "Digital media subscription or cinema multiplex booking."
  },

  // 11. Investments & Financial Services
  {
    name: "Stocks, Mutual Funds, Loans & Insurance",
    category: "Investments & Financial Services",
    pattern: /\b(zerodha|groww|upstox|angel\s*one|mutual\s*fund|sip\s*debit|nippon\s*india|hdfc\s*mf|sbi\s*mf|icici\s*pru|cred|credit\s*card\s*bill|sbi\s*cards|loan\s*emi|home\s*loan|bajaj\s*finance|lic\s*india|hdfc\s*life|star\s*health|insurance\s*prem)\b/i,
    confidence: 0.97,
    explanation: "Stock broker, mutual fund SIP, credit card settlement, loan EMI, or insurance."
  },

  // 12. Rent & Maintenance
  {
    name: "House Rent & Maintenance",
    category: "Rent & Maintenance",
    pattern: /\b(house\s*rent|rent\s*transfer|apartment\s*maint|society\s*maintenance|nobroker|magicbricks|rental\s*lease)\b/i,
    confidence: 0.96,
    explanation: "Apartment maintenance charge or monthly residential rent transfer."
  },

  // 13. Education & Learning
  {
    name: "Education & Courses",
    category: "Education & Learning",
    pattern: /\b(udemy|coursera|unacademy|allen\s*career|school\s*fee|college\s*fee|tuition|university|exam\s*fee|coaching\s*institute)\b/i,
    confidence: 0.95,
    explanation: "Educational institution tuition, certification course, or coaching fees."
  },

  // 14. Peer to Peer Transfers
  {
    name: "P2P UPI & Transfers",
    category: "Peer-to-Peer & Transfers",
    pattern: /\b(upi\/p2a|upi\/cr\/|splitwise|transfer\s*to\s*[a-z]+|p2p|funds\s*transfer\s*to)\b/i,
    confidence: 0.88,
    explanation: "Peer-to-person UPI transfer or direct beneficiary funds transfer."
  }
];

export class HeuristicClassifier {
  /**
   * Run rule-based heuristic matching.
   */
  public classify(
    description: string,
    debit: number | null,
    credit: number | null,
    mode?: TransactionMode
  ): HeuristicRuleMatch | null {
    const text = description.trim();

    for (const rule of HEURISTIC_PATTERNS) {
      if (rule.creditOnly && (!credit || credit <= 0)) continue;
      if (rule.debitOnly && (!debit || debit <= 0)) continue;

      if (rule.pattern.test(text)) {
        return {
          category: rule.category,
          confidence: rule.confidence,
          ruleName: rule.name,
          explanation: rule.explanation,
        };
      }
    }

    // Special Mode-based fallback heuristics
    if (mode === 'ATM') {
      return {
        category: 'Cash & ATM',
        confidence: 0.95,
        ruleName: 'ATM Mode Identifier',
        explanation: 'Transaction channel identified as ATM withdrawal.',
      };
    }

    if (mode === 'INTEREST' && credit && credit > 0) {
      return {
        category: 'Bank Charges & Interest',
        confidence: 0.98,
        ruleName: 'Interest Channel Rule',
        explanation: 'Bank interest credit channel identified.',
      };
    }

    if (mode === 'SALARY' && credit && credit > 0) {
      return {
        category: 'Salary & Income',
        confidence: 0.99,
        ruleName: 'Salary Channel Rule',
        explanation: 'Bank salary credit channel identified.',
      };
    }

    return null;
  }
}

export const heuristicClassifier = new HeuristicClassifier();
