# Befree - Bank Statement Processing & Classification System

An intelligent, production-ready system for processing bank statements in PDF format (both digital text-based and scanned image-based), extracting financial metadata and transaction tabular data, and classifying financial transactions using **Non-LLM** approaches (Heuristic Rule-Based Engine + Traditional Machine Learning).

Built for the **Befree AI & Automation Assessment**.

---

## 🌟 Key Features

### 1. Dual PDF Pipeline (Auto-Detect Text vs Scanned/Image)
- **Text-based PDFs**: High-fidelity digital text stream extraction and tabular parser.
- **Image-based / Scanned PDFs**: Detects low text density & raster images, automatically routing through the OCR (Optical Character Recognition) pipeline.
- Instant confidence score and detailed breakdown of page text density.

### 2. Financial Metadata & Transaction Extraction
- **Account Metadata**: Account Holder Name, Account Number, Bank Name, IFSC / Branch, Statement Period (From/To), Opening and Closing balances.
- **Transaction Table**: Date, Narration/Description, Debit (₹), Credit (₹), Running Balance, Mode (UPI, NEFT, IMPS, RTGS, POS, ATM, ACH, Salary, Charges, Interest), and Reference/UTR.

### 3. Non-LLM Transaction Classification Engine
Zero reliance on LLMs (OpenAI, Anthropic, Gemini, etc.). Employs a robust two-stage ensemble:
1. **Deterministic Heuristic Rule-Based Approach**:
   - 20+ fine-grained financial regular expressions.
   - Comprehensive Indian & international merchant dictionaries (Swiggy, Zomato, Blinkit, Zepto, Amazon, Flipkart, BESCOM, Tata Power, Uber, Apollo Pharmacy, Netflix, Zerodha, Cred, etc.).
   - Accounting direction rules (e.g. Credit + Salary $\to$ `Salary & Income`, Debit + ATM $\to$ `Cash & ATM`, Credit + Interest $\to$ `Bank Charges & Interest`).
2. **Traditional Machine Learning Model (TF-IDF + Multinomial Naive Bayes)**:
   - Unigram and bigram tokenization with stop-word filtration.
   - Sublinear term-frequency scaling and smooth Inverse Document Frequency ($IDF$).
   - Multinomial Naive Bayes classifier with Laplace smoothing ($\alpha = 1.0$).
   - Softmax posterior probabilities, returning top prediction and ranked alternates.

### 4. Interactive Financial Analytics & Usability
- Category expense breakdown with percentage shares.
- Inflow vs Outflow cash flow analysis.
- Anomaly / Duplicate transaction detection (flags duplicate debits on same date or extreme high-value outliers).
- **Inline Category Override**: Click any category tag in the table to reclassify instantly.
- **Interactive ML Playground**: Test arbitrary narrations live and inspect token activations.

### 5. Multi-Format Structured Export
- **Excel (.xlsx)**: Professional multi-tab workbook with styled columns (`Transactions`, `Category Summary`, `Account Overview`).
- **CSV (.csv)**: Clean RFC-4180 compliant comma-separated file.
- **JSON (.json)**: Full structured JSON for API and automation pipelines.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 and Node 24)
- npm or yarn

### Installation
```bash
git clone https://github.com/Tamanna154/befree-bank-statement-processor.git
cd befree-bank-statement-processor
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── classify/route.ts        # Live test API for Non-LLM classifiers
│   │   │   └── parse-statement/route.ts # File parsing & PDF pipeline
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Main dashboard view
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── UploadSection.tsx            # Drag & drop upload + 1-Click test samples
│   │   ├── StatementOverview.tsx        # Auto-detect banner, account card & KPI cards
│   │   ├── AnalyticsCharts.tsx          # Category breakdown & cash flow ratio
│   │   ├── TransactionTable.tsx         # Interactive table with search, filter & inline edit
│   │   ├── ClassificationPlayground.tsx # Live Non-LLM rule & ML tester
│   │   └── ArchitectureModal.tsx        # Assessment requirements specification
│   └── lib/
│       ├── types.ts                     # TypeScript domain models
│       ├── classifiers/
│       │   ├── heuristics.ts            # High-precision rule-based engine
│       │   ├── traditional-ml.ts        # TF-IDF + Multinomial Naive Bayes ML classifier
│       │   ├── training-dataset.ts      # Curated banking dataset across 15 categories
│       │   └── hybrid-classifier.ts     # Ensemble coordinator & summary computer
│       ├── parsers/
│       │   ├── detector.ts              # PDF type auto-detector (text vs scanned)
│       │   └── text-parser.ts           # Account info & tabular transaction extractor
│       ├── samples/
│       │   └── sample-statements.ts     # Pre-loaded realistic statements (HDFC, SBI OCR, ICICI)
│       └── exporters/
│           ├── excel-exporter.ts        # Multi-sheet .xlsx generator (SheetJS)
│           └── csv-exporter.ts          # Standard CSV generator
```

