# DealStage Platform Documentation -- Batch 7

**Company:** DealStage (legal entity: PartnerIQ)
**URL:** thedealstage.com
**Generated:** 2026-03-29
**Deliverables in this batch:** 22, 23, 24, 25, 26

---

# DELIVERABLE 22: PRICING MODEL CALCULATOR

## 1. Unit Economics per Tier per Role

All costs are monthly unless otherwise noted. Stripe processing fee is 2.9% + $0.30 per successful charge.

### 1.1 AI Cost Modeling Assumptions

| Parameter                   | Value                                        |
| --------------------------- | -------------------------------------------- |
| Claude Sonnet 4 cost        | $3.00 per 1M tokens                          |
| GPT-4o-mini cost            | $0.15 per 1M tokens                          |
| Average tokens per AI query | 2,500 (input) + 1,500 (output) = 4,000 total |
| Claude cost per query       | $0.012                                       |
| GPT-4o-mini cost per query  | $0.0006                                      |
| Routing split (paid tiers)  | 30% Claude / 70% GPT-4o-mini                 |
| Routing split (free tier)   | 0% Claude / 100% GPT-4o-mini                 |
| Free tier queries           | 5/month                                      |
| Starter tier queries        | 50/month                                     |
| Growth tier avg usage       | 120/month                                    |
| Enterprise tier avg usage   | 300/month                                    |

**Blended cost per query (paid routing):** (0.30 x $0.012) + (0.70 x $0.0006) = $0.0036 + $0.00042 = **$0.00402**

**Cost per query (free routing):** $0.0006

### 1.2 Infrastructure Cost Allocation Assumptions

| Component          | Monthly Cost | Allocation Method                                           |
| ------------------ | ------------ | ----------------------------------------------------------- |
| Supabase Pro       | $25          | Per-row storage; $0.005/user base + $0.001/active query row |
| Vercel Pro         | $20          | Per-request bandwidth; $0.004/user base + usage scaling     |
| Railway (Crawl4AI) | $12 avg      | Allocated to brand/agency crawl features; $0.02/crawl job   |
| Resend (email)     | $10 avg      | $0.001/email; est. 20 emails/user/month = $0.02/user        |
| Sentry             | $13 avg      | Flat allocation across all users; $0.003/user at 1K+ scale  |
| Domain/DNS         | $15          | Fixed; not allocated per user                               |
| GrowMeOrganic      | $49          | Allocated to brand/agency data enrichment; $0.05/enrichment |

**Base infrastructure per user (at 500 users):** $0.03/user/month (Supabase + Vercel + Sentry + Resend)

**Support cost estimate per tier:**

| Tier       | Monthly Support Cost/User | Basis                                      |
| ---------- | ------------------------- | ------------------------------------------ |
| Free       | $0.00                     | Self-serve only, community forum           |
| Starter    | $0.50                     | Email support, 48h SLA                     |
| Growth     | $1.50                     | Priority email, 24h SLA                    |
| Enterprise | $5.00                     | Dedicated support, 4h SLA, onboarding call |

---

### 1.3 Talent Role Unit Economics

| Metric                           | Free   | Starter ($99) | Growth ($199) | Enterprise ($499) |
| -------------------------------- | ------ | ------------- | ------------- | ----------------- |
| **Monthly Revenue**              | $0.00  | $99.00        | $199.00       | $499.00           |
| **Annual Revenue (10 mo equiv)** | $0.00  | $990.00       | $1,990.00     | $4,990.00         |
| **Stripe Fee (monthly)**         | $0.00  | $3.17         | $6.07         | $14.77            |
| **AI Queries/Month**             | 5      | 50            | 120           | 300               |
| **AI Cost/Month**                | $0.003 | $0.20         | $0.48         | $1.21             |
| **Infrastructure/Month**         | $0.03  | $0.03         | $0.03         | $0.03             |
| **Support Cost/Month**           | $0.00  | $0.50         | $1.50         | $5.00             |
| **Total COGS/Month**             | $0.03  | $3.90         | $8.08         | $21.01            |
| **Gross Profit/Month**           | -$0.03 | $95.10        | $190.92       | $477.99           |
| **Gross Margin**                 | N/A    | 96.1%         | 95.9%         | 95.8%             |
| **Contribution Margin/Month**    | -$0.03 | $95.10        | $190.92       | $477.99           |

### 1.4 Brand Role Unit Economics

| Metric                           | Free   | Starter ($299) | Growth ($599) | Enterprise ($1,499) |
| -------------------------------- | ------ | -------------- | ------------- | ------------------- |
| **Monthly Revenue**              | $0.00  | $299.00        | $599.00       | $1,499.00           |
| **Annual Revenue (10 mo equiv)** | $0.00  | $2,990.00      | $5,990.00     | $14,990.00          |
| **Stripe Fee (monthly)**         | $0.00  | $8.97          | $17.67        | $43.77              |
| **AI Queries/Month**             | 5      | 50             | 120           | 300                 |
| **AI Cost/Month**                | $0.003 | $0.20          | $0.48         | $1.21               |
| **Infrastructure/Month**         | $0.05  | $0.08          | $0.10         | $0.15               |
| **Crawl/Enrichment Cost**        | $0.00  | $0.50          | $1.00         | $2.50               |
| **Support Cost/Month**           | $0.00  | $0.50          | $1.50         | $5.00               |
| **Total COGS/Month**             | $0.05  | $10.25         | $20.75        | $52.63              |
| **Gross Profit/Month**           | -$0.05 | $288.75        | $578.25       | $1,446.37           |
| **Gross Margin**                 | N/A    | 96.6%          | 96.5%         | 96.5%               |
| **Contribution Margin/Month**    | -$0.05 | $288.75        | $578.25       | $1,446.37           |

### 1.5 Agency Role Unit Economics

| Metric                           | Free   | Starter ($799) | Growth ($1,499) | Enterprise ($3,499) |
| -------------------------------- | ------ | -------------- | --------------- | ------------------- |
| **Monthly Revenue**              | $0.00  | $799.00        | $1,499.00       | $3,499.00           |
| **Annual Revenue (10 mo equiv)** | $0.00  | $7,990.00      | $14,990.00      | $34,990.00          |
| **Stripe Fee (monthly)**         | $0.00  | $23.47         | $43.77          | $101.77             |
| **AI Queries/Month**             | 5      | 50             | 120             | 300                 |
| **AI Cost/Month**                | $0.003 | $0.20          | $0.48           | $1.21               |
| **Infrastructure/Month**         | $0.08  | $0.12          | $0.18           | $0.30               |
| **Crawl/Enrichment Cost**        | $0.00  | $1.00          | $2.50           | $5.00               |
| **Support Cost/Month**           | $0.00  | $0.50          | $1.50           | $5.00               |
| **Total COGS/Month**             | $0.08  | $25.29         | $48.43          | $113.28             |
| **Gross Profit/Month**           | -$0.08 | $773.71        | $1,450.57       | $3,385.72           |
| **Gross Margin**                 | N/A    | 96.8%          | 96.8%           | 96.8%               |
| **Contribution Margin/Month**    | -$0.08 | $773.71        | $1,450.57       | $3,385.72           |

### 1.6 Manager Role Unit Economics

| Metric                           | Free   | Starter ($199) | Growth ($499) | Enterprise ($999) |
| -------------------------------- | ------ | -------------- | ------------- | ----------------- |
| **Monthly Revenue**              | $0.00  | $199.00        | $499.00       | $999.00           |
| **Annual Revenue (10 mo equiv)** | $0.00  | $1,990.00      | $4,990.00     | $9,990.00         |
| **Stripe Fee (monthly)**         | $0.00  | $6.07          | $14.77        | $29.27            |
| **AI Queries/Month**             | 5      | 50             | 120           | 300               |
| **AI Cost/Month**                | $0.003 | $0.20          | $0.48         | $1.21             |
| **Infrastructure/Month**         | $0.03  | $0.05          | $0.05         | $0.08             |
| **Support Cost/Month**           | $0.00  | $0.50          | $1.50         | $5.00             |
| **Total COGS/Month**             | $0.03  | $6.82          | $16.80        | $35.56            |
| **Gross Profit/Month**           | -$0.03 | $192.18        | $482.20       | $963.44           |
| **Gross Margin**                 | N/A    | 96.6%          | 96.6%         | 96.4%             |
| **Contribution Margin/Month**    | -$0.03 | $192.18        | $482.20       | $963.44           |

---

## 2. Scenario Modeling

### Role Mix Assumptions (constant across all scenarios)

| Role    | Mix % | Free % | Starter % | Growth % | Enterprise % |
| ------- | ----- | ------ | --------- | -------- | ------------ |
| Talent  | 40%   | 70%    | 18%       | 8%       | 4%           |
| Brand   | 30%   | 60%    | 22%       | 12%      | 6%           |
| Agency  | 20%   | 55%    | 25%       | 13%      | 7%           |
| Manager | 10%   | 65%    | 20%       | 10%      | 5%           |

### Weighted Average Revenue per Paid User (ARPU) Calculation

**Talent ARPU:** (0.18 x $99) + (0.08 x $199) + (0.04 x $499) = $17.82 + $15.92 + $19.96 = **$53.70/paid user** across all talent users; per paying talent = $53.70 / 0.30 = **$179.00**

**Brand ARPU:** (0.22 x $299) + (0.12 x $599) + (0.06 x $1,499) = $65.78 + $71.88 + $89.94 = **$227.60/paid user** across all brand users; per paying brand = $227.60 / 0.40 = **$569.00**

**Agency ARPU:** (0.25 x $799) + (0.13 x $1,499) + (0.07 x $3,499) = $199.75 + $194.87 + $244.93 = **$639.55/paid user** across all agency users; per paying agency = $639.55 / 0.45 = **$1,421.22**

**Manager ARPU:** (0.20 x $199) + (0.10 x $499) + (0.05 x $999) = $39.80 + $49.90 + $49.95 = **$139.65/paid user** across all manager users; per paying manager = $139.65 / 0.35 = **$399.00**

---

### 2.1 Scenario: 100 Users

| Role      | Count   | Free   | Starter | Growth | Enterprise |
| --------- | ------- | ------ | ------- | ------ | ---------- |
| Talent    | 40      | 28     | 7       | 3      | 2          |
| Brand     | 30      | 18     | 7       | 4      | 1          |
| Agency    | 20      | 11     | 5       | 3      | 1          |
| Manager   | 10      | 7      | 2       | 1      | 0          |
| **Total** | **100** | **64** | **21**  | **11** | **4**      |

**Monthly Recurring Revenue (MRR):**

| Role      | Starter Rev       | Growth Rev          | Enterprise Rev      | Total       |
| --------- | ----------------- | ------------------- | ------------------- | ----------- |
| Talent    | 7 x $99 = $693    | 3 x $199 = $597     | 2 x $499 = $998     | $2,288      |
| Brand     | 7 x $299 = $2,093 | 4 x $599 = $2,396   | 1 x $1,499 = $1,499 | $5,988      |
| Agency    | 5 x $799 = $3,995 | 3 x $1,499 = $4,497 | 1 x $3,499 = $3,499 | $11,991     |
| Manager   | 2 x $199 = $398   | 1 x $499 = $499     | 0 x $999 = $0       | $897        |
| **Total** | **$7,179**        | **$7,989**          | **$5,996**          | **$21,164** |

| Metric                        | Value                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **MRR**                       | $21,164                                                                         |
| **ARR**                       | $253,968                                                                        |
| **Paid Users**                | 36 (36% conversion)                                                             |
| **ARPU (all users)**          | $211.64                                                                         |
| **ARPU (paid only)**          | $587.89                                                                         |
| **Total AI Queries/Month**    | 64x5 + 21x50 + 11x120 + 4x300 = 320 + 1,050 + 1,320 + 1,200 = 3,890             |
| **AI Cost/Month**             | 320 x $0.0006 + (1,050+1,320+1,200) x $0.00402 = $0.19 + $14.35 = **$14.54**    |
| **Infrastructure Cost/Month** | $25 + $20 + $12 + $10 + $13 + $15 + $49 = **$144** (mostly fixed at this scale) |
| **Stripe Fees/Month**         | $21,164 x 0.029 + 36 x $0.30 = $613.76 + $10.80 = **$624.56**                   |
| **Support Cost/Month**        | 21x$0.50 + 11x$1.50 + 4x$5.00 = $10.50 + $16.50 + $20.00 = **$47.00**           |
| **Total COGS/Month**          | $14.54 + $144 + $624.56 + $47.00 = **$830.10**                                  |
| **Gross Profit/Month**        | $21,164 - $830.10 = **$20,333.90**                                              |
| **Gross Margin**              | **96.1%**                                                                       |
| **Est. Operating Expenses**   | $8,000 (founder salary $5K, marketing $2K, legal/tools $1K)                     |
| **Net Operating Income**      | $20,333.90 - $8,000 = **$12,333.90**                                            |
| **Net Margin**                | **58.3%**                                                                       |

---

### 2.2 Scenario: 500 Users

| Role      | Count   | Free    | Starter | Growth | Enterprise |
| --------- | ------- | ------- | ------- | ------ | ---------- |
| Talent    | 200     | 140     | 36      | 16     | 8          |
| Brand     | 150     | 90      | 33      | 18     | 9          |
| Agency    | 100     | 55      | 25      | 13     | 7          |
| Manager   | 50      | 33      | 10      | 5      | 2          |
| **Total** | **500** | **318** | **104** | **52** | **26**     |

**MRR Calculation:**

| Role      | Starter             | Growth                | Enterprise           | Total        |
| --------- | ------------------- | --------------------- | -------------------- | ------------ |
| Talent    | 36 x $99 = $3,564   | 16 x $199 = $3,184    | 8 x $499 = $3,992    | $10,740      |
| Brand     | 33 x $299 = $9,867  | 18 x $599 = $10,782   | 9 x $1,499 = $13,491 | $34,140      |
| Agency    | 25 x $799 = $19,975 | 13 x $1,499 = $19,487 | 7 x $3,499 = $24,493 | $63,955      |
| Manager   | 10 x $199 = $1,990  | 5 x $499 = $2,495     | 2 x $999 = $1,998    | $6,483       |
| **Total** | **$35,396**         | **$35,948**           | **$43,974**          | **$115,318** |

| Metric                        | Value                                                                     |
| ----------------------------- | ------------------------------------------------------------------------- |
| **MRR**                       | $115,318                                                                  |
| **ARR**                       | $1,383,816                                                                |
| **Paid Users**                | 182 (36.4% conversion)                                                    |
| **ARPU (paid only)**          | $633.62                                                                   |
| **AI Queries/Month**          | 318x5 + 104x50 + 52x120 + 26x300 = 1,590 + 5,200 + 6,240 + 7,800 = 20,830 |
| **AI Cost/Month**             | 1,590 x $0.0006 + 19,240 x $0.00402 = $0.95 + $77.34 = **$78.30**         |
| **Infrastructure Cost/Month** | $25 + $20 + $15 + $15 + $13 + $15 + $49 = **$152** (slight scaling)       |
| **Stripe Fees/Month**         | $115,318 x 0.029 + 182 x $0.30 = $3,344.22 + $54.60 = **$3,398.82**       |
| **Support Cost/Month**        | 104x$0.50 + 52x$1.50 + 26x$5.00 = $52 + $78 + $130 = **$260**             |
| **Total COGS/Month**          | $78.30 + $152 + $3,398.82 + $260 = **$3,889.12**                          |
| **Gross Profit/Month**        | $115,318 - $3,889.12 = **$111,428.88**                                    |
| **Gross Margin**              | **96.6%**                                                                 |
| **Est. Operating Expenses**   | $35,000 (payroll $20K, marketing $10K, legal/tools $5K)                   |
| **Net Operating Income**      | $111,428.88 - $35,000 = **$76,428.88**                                    |
| **Net Margin**                | **66.3%**                                                                 |

---

### 2.3 Scenario: 1,000 Users

| Role      | Count     | Free    | Starter | Growth  | Enterprise |
| --------- | --------- | ------- | ------- | ------- | ---------- |
| Talent    | 400       | 280     | 72      | 32      | 16         |
| Brand     | 300       | 180     | 66      | 36      | 18         |
| Agency    | 200       | 110     | 50      | 26      | 14         |
| Manager   | 100       | 65      | 20      | 10      | 5          |
| **Total** | **1,000** | **635** | **208** | **104** | **53**     |

**MRR Calculation:**

| Role      | Starter             | Growth                | Enterprise            | Total        |
| --------- | ------------------- | --------------------- | --------------------- | ------------ |
| Talent    | 72 x $99 = $7,128   | 32 x $199 = $6,368    | 16 x $499 = $7,984    | $21,480      |
| Brand     | 66 x $299 = $19,734 | 36 x $599 = $21,564   | 18 x $1,499 = $26,982 | $68,280      |
| Agency    | 50 x $799 = $39,950 | 26 x $1,499 = $38,974 | 14 x $3,499 = $48,986 | $127,910     |
| Manager   | 20 x $199 = $3,980  | 10 x $499 = $4,990    | 5 x $999 = $4,995     | $13,965      |
| **Total** | **$70,792**         | **$71,896**           | **$88,947**           | **$231,635** |

| Metric                        | Value                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------- |
| **MRR**                       | $231,635                                                                      |
| **ARR**                       | $2,779,620                                                                    |
| **Paid Users**                | 365 (36.5% conversion)                                                        |
| **ARPU (paid only)**          | $634.62                                                                       |
| **AI Queries/Month**          | 635x5 + 208x50 + 104x120 + 53x300 = 3,175 + 10,400 + 12,480 + 15,900 = 41,955 |
| **AI Cost/Month**             | 3,175 x $0.0006 + 38,780 x $0.00402 = $1.91 + $155.90 = **$157.80**           |
| **Infrastructure Cost/Month** | $25 + $20 + $18 + $20 + $26 + $15 + $49 = **$173**                            |
| **Stripe Fees/Month**         | $231,635 x 0.029 + 365 x $0.30 = $6,717.42 + $109.50 = **$6,826.92**          |
| **Support Cost/Month**        | 208x$0.50 + 104x$1.50 + 53x$5.00 = $104 + $156 + $265 = **$525**              |
| **Total COGS/Month**          | $157.80 + $173 + $6,826.92 + $525 = **$7,682.72**                             |
| **Gross Profit/Month**        | $231,635 - $7,682.72 = **$223,952.28**                                        |
| **Gross Margin**              | **96.7%**                                                                     |
| **Est. Operating Expenses**   | $75,000 (payroll $45K, marketing $20K, legal/tools $10K)                      |
| **Net Operating Income**      | $223,952.28 - $75,000 = **$148,952.28**                                       |
| **Net Margin**                | **64.3%**                                                                     |

---

### 2.4 Scenario: 5,000 Users

| Role      | Count     | Free      | Starter   | Growth  | Enterprise |
| --------- | --------- | --------- | --------- | ------- | ---------- |
| Talent    | 2,000     | 1,400     | 360       | 160     | 80         |
| Brand     | 1,500     | 900       | 330       | 180     | 90         |
| Agency    | 1,000     | 550       | 250       | 130     | 70         |
| Manager   | 500       | 325       | 100       | 50      | 25         |
| **Total** | **5,000** | **3,175** | **1,040** | **520** | **265**    |

**MRR Calculation:**

| Role      | Starter               | Growth                  | Enterprise             | Total          |
| --------- | --------------------- | ----------------------- | ---------------------- | -------------- |
| Talent    | 360 x $99 = $35,640   | 160 x $199 = $31,840    | 80 x $499 = $39,920    | $107,400       |
| Brand     | 330 x $299 = $98,670  | 180 x $599 = $107,820   | 90 x $1,499 = $134,910 | $341,400       |
| Agency    | 250 x $799 = $199,750 | 130 x $1,499 = $194,870 | 70 x $3,499 = $244,930 | $639,550       |
| Manager   | 100 x $199 = $19,900  | 50 x $499 = $24,950     | 25 x $999 = $24,975    | $69,825        |
| **Total** | **$353,960**          | **$359,480**            | **$444,735**           | **$1,158,175** |

| Metric                        | Value                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| **MRR**                       | $1,158,175                                                                           |
| **ARR**                       | $13,898,100                                                                          |
| **Paid Users**                | 1,825 (36.5% conversion)                                                             |
| **ARPU (paid only)**          | $634.62                                                                              |
| **AI Queries/Month**          | 3,175x5 + 1,040x50 + 520x120 + 265x300 = 15,875 + 52,000 + 62,400 + 79,500 = 209,775 |
| **AI Cost/Month**             | 15,875 x $0.0006 + 193,900 x $0.00402 = $9.53 + $779.48 = **$789.00**                |
| **Infrastructure Cost/Month** | $75 + $60 + $50 + $50 + $26 + $15 + $49 = **$325** (Supabase/Vercel scale up)        |
| **Stripe Fees/Month**         | $1,158,175 x 0.029 + 1,825 x $0.30 = $33,587.08 + $547.50 = **$34,134.58**           |
| **Support Cost/Month**        | 1,040x$0.50 + 520x$1.50 + 265x$5.00 = $520 + $780 + $1,325 = **$2,625**              |
| **Total COGS/Month**          | $789 + $325 + $34,134.58 + $2,625 = **$37,873.58**                                   |
| **Gross Profit/Month**        | $1,158,175 - $37,873.58 = **$1,120,301.42**                                          |
| **Gross Margin**              | **96.7%**                                                                            |
| **Est. Operating Expenses**   | $250,000 (payroll $150K, marketing $60K, legal/tools $20K, office $20K)              |
| **Net Operating Income**      | $1,120,301.42 - $250,000 = **$870,301.42**                                           |
| **Net Margin**                | **75.1%**                                                                            |

---

### 2.5 Scenario: 10,000 Users

| Role      | Count      | Free      | Starter   | Growth    | Enterprise |
| --------- | ---------- | --------- | --------- | --------- | ---------- |
| Talent    | 4,000      | 2,800     | 720       | 320       | 160        |
| Brand     | 3,000      | 1,800     | 660       | 360       | 180        |
| Agency    | 2,000      | 1,100     | 500       | 260       | 140        |
| Manager   | 1,000      | 650       | 200       | 100       | 50         |
| **Total** | **10,000** | **6,350** | **2,080** | **1,040** | **530**    |

**MRR Calculation:**

| Role      | Starter               | Growth                  | Enterprise              | Total          |
| --------- | --------------------- | ----------------------- | ----------------------- | -------------- |
| Talent    | 720 x $99 = $71,280   | 320 x $199 = $63,680    | 160 x $499 = $79,840    | $214,800       |
| Brand     | 660 x $299 = $197,340 | 360 x $599 = $215,640   | 180 x $1,499 = $269,820 | $682,800       |
| Agency    | 500 x $799 = $399,500 | 260 x $1,499 = $389,740 | 140 x $3,499 = $489,860 | $1,279,100     |
| Manager   | 200 x $199 = $39,800  | 100 x $499 = $49,900    | 50 x $999 = $49,950     | $139,650       |
| **Total** | **$707,920**          | **$718,960**            | **$889,470**            | **$2,316,350** |

| Metric                        | Value                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **MRR**                       | $2,316,350                                                                                |
| **ARR**                       | $27,796,200                                                                               |
| **Paid Users**                | 3,650 (36.5% conversion)                                                                  |
| **ARPU (paid only)**          | $634.62                                                                                   |
| **AI Queries/Month**          | 6,350x5 + 2,080x50 + 1,040x120 + 530x300 = 31,750 + 104,000 + 124,800 + 159,000 = 419,550 |
| **AI Cost/Month**             | 31,750 x $0.0006 + 387,800 x $0.00402 = $19.05 + $1,558.96 = **$1,578.01**                |
| **Infrastructure Cost/Month** | $150 + $120 + $80 + $100 + $26 + $15 + $49 = **$540**                                     |
| **Stripe Fees/Month**         | $2,316,350 x 0.029 + 3,650 x $0.30 = $67,174.15 + $1,095 = **$68,269.15**                 |
| **Support Cost/Month**        | 2,080x$0.50 + 1,040x$1.50 + 530x$5.00 = $1,040 + $1,560 + $2,650 = **$5,250**             |
| **Total COGS/Month**          | $1,578.01 + $540 + $68,269.15 + $5,250 = **$75,637.16**                                   |
| **Gross Profit/Month**        | $2,316,350 - $75,637.16 = **$2,240,712.84**                                               |
| **Gross Margin**              | **96.7%**                                                                                 |
| **Est. Operating Expenses**   | $500,000 (payroll $300K, marketing $120K, legal/tools $30K, office $50K)                  |
| **Net Operating Income**      | $2,240,712.84 - $500,000 = **$1,740,712.84**                                              |
| **Net Margin**                | **75.1%**                                                                                 |

---

### 2.6 Scenario Summary Table

| Metric          | 100 Users | 500 Users  | 1,000 Users | 5,000 Users | 10,000 Users |
| --------------- | --------- | ---------- | ----------- | ----------- | ------------ |
| MRR             | $21,164   | $115,318   | $231,635    | $1,158,175  | $2,316,350   |
| ARR             | $253,968  | $1,383,816 | $2,779,620  | $13,898,100 | $27,796,200  |
| Paid Users      | 36        | 182        | 365         | 1,825       | 3,650        |
| Paid Conversion | 36%       | 36.4%      | 36.5%       | 36.5%       | 36.5%        |
| Total COGS      | $830      | $3,889     | $7,683      | $37,874     | $75,637      |
| Gross Margin    | 96.1%     | 96.6%      | 96.7%       | 96.7%       | 96.7%        |
| OpEx            | $8,000    | $35,000    | $75,000     | $250,000    | $500,000     |
| Net Income      | $12,334   | $76,429    | $148,952    | $870,301    | $1,740,713   |
| Net Margin      | 58.3%     | 66.3%      | 64.3%       | 75.1%       | 75.1%        |

---

## 3. Break-Even Analysis

### 3.1 Fixed Costs (Monthly)

| Category              | Amount     | Notes                       |
| --------------------- | ---------- | --------------------------- |
| Supabase Pro          | $25        | Fixed up to ~5K users       |
| Vercel Pro            | $20        | Fixed up to ~2K users       |
| Railway (Crawl4AI)    | $12        | Base cost                   |
| GrowMeOrganic         | $49        | Flat subscription           |
| Resend (base)         | $5         | Base tier                   |
| Sentry (base)         | $13        | Base plan                   |
| Domain/DNS            | $15        | Fixed                       |
| Founder Salary        | $5,000     | Minimum viable draw         |
| Basic Tools/Software  | $500       | GitHub, Figma, Notion, etc. |
| Legal Retainer        | $500       | Fractional legal            |
| **Total Fixed Costs** | **$6,139** |                             |

### 3.2 Variable Costs per Paid User (Blended Average)

| Cost Component                          | Per Paid User/Month |
| --------------------------------------- | ------------------- |
| Stripe Processing (avg on $634.62 ARPU) | $18.70              |
| AI Queries (avg 140 queries x $0.00402) | $0.56               |
| Infrastructure Scaling                  | $0.08               |
| Support (blended)                       | $1.44               |
| **Total Variable Cost/Paid User**       | **$20.78**          |

### 3.3 Variable Cost per Free User

| Cost Component                    | Per Free User/Month |
| --------------------------------- | ------------------- |
| AI Queries (5 x $0.0006)          | $0.003              |
| Infrastructure                    | $0.03               |
| **Total Variable Cost/Free User** | **$0.033**          |

### 3.4 Break-Even Calculation

**Blended ARPU (across all users, paid and free):** At 36.5% conversion, blended ARPU = $634.62 x 0.365 = **$231.64/user**

**Blended variable cost per user:** (0.365 x $20.78) + (0.635 x $0.033) = $7.58 + $0.02 = **$7.60/user**

**Contribution margin per user:** $231.64 - $7.60 = **$224.04/user**

**Break-even users (fixed costs only):** $6,139 / $224.04 = **27.4 users** (rounded up to **28 total users**, of which ~10 are paid)

**Break-even MRR:** 10 paid users x $634.62 = **$6,346.20 MRR**

### 3.5 Break-Even by Tier (Standalone)

How many paid users of a single tier are needed to cover fixed costs:

| Tier               | Avg Monthly Revenue | Variable Cost/User | Contribution/User | Users to Break Even |
| ------------------ | ------------------- | ------------------ | ----------------- | ------------------- |
| Talent Starter     | $99                 | $3.90              | $95.10            | 65                  |
| Talent Growth      | $199                | $8.08              | $190.92           | 33                  |
| Talent Enterprise  | $499                | $21.01             | $477.99           | 13                  |
| Brand Starter      | $299                | $10.25             | $288.75           | 22                  |
| Brand Growth       | $599                | $20.75             | $578.25           | 11                  |
| Brand Enterprise   | $1,499              | $52.63             | $1,446.37         | 5                   |
| Agency Starter     | $799                | $25.29             | $773.71           | 8                   |
| Agency Growth      | $1,499              | $48.43             | $1,450.57         | 5                   |
| Agency Enterprise  | $3,499              | $113.28            | $3,385.72         | 2                   |
| Manager Starter    | $199                | $6.82              | $192.18           | 32                  |
| Manager Growth     | $499                | $16.80             | $482.20           | 13                  |
| Manager Enterprise | $999                | $35.56             | $963.44           | 7                   |

**Key Insight:** Just 2 Agency Enterprise customers cover all fixed costs. Just 5 Brand Enterprise customers achieve the same. The platform reaches profitability extremely early due to low infrastructure costs and SaaS-native architecture.

---

## 4. Price Sensitivity Analysis

### 4.1 Current vs. +20% vs. -20% Pricing

**Talent Pricing Scenarios:**

| Tier       | Current | +20% | -20% |
| ---------- | ------- | ---- | ---- |
| Starter    | $99     | $119 | $79  |
| Growth     | $199    | $239 | $159 |
| Enterprise | $499    | $599 | $399 |

**Brand Pricing Scenarios:**

| Tier       | Current | +20%   | -20%   |
| ---------- | ------- | ------ | ------ |
| Starter    | $299    | $359   | $239   |
| Growth     | $599    | $719   | $479   |
| Enterprise | $1,499  | $1,799 | $1,199 |

**Agency Pricing Scenarios:**

| Tier       | Current | +20%   | -20%   |
| ---------- | ------- | ------ | ------ |
| Starter    | $799    | $959   | $639   |
| Growth     | $1,499  | $1,799 | $1,199 |
| Enterprise | $3,499  | $4,199 | $2,799 |

**Manager Pricing Scenarios:**

| Tier       | Current | +20%   | -20% |
| ---------- | ------- | ------ | ---- |
| Starter    | $199    | $239   | $159 |
| Growth     | $499    | $599   | $399 |
| Enterprise | $999    | $1,199 | $799 |

### 4.2 Revenue Impact at 1,000 Users

| Scenario                           | MRR      | ARR        | Delta vs. Current     | Assumed Conversion Impact |
| ---------------------------------- | -------- | ---------- | --------------------- | ------------------------- |
| Current pricing                    | $231,635 | $2,779,620 | Baseline              | 36.5% paid                |
| +20% pricing (same conversion)     | $277,962 | $3,335,544 | +$46,327 MRR (+20%)   | 36.5% paid                |
| +20% pricing (elasticity-adjusted) | $255,719 | $3,068,628 | +$24,084 MRR (+10.4%) | 33.6% paid (8% drop)      |
| -20% pricing (same conversion)     | $185,308 | $2,223,696 | -$46,327 MRR (-20%)   | 36.5% paid                |
| -20% pricing (elasticity-adjusted) | $198,802 | $2,385,624 | -$32,833 MRR (-14.2%) | 39.2% paid (7.5% lift)    |

**Elasticity assumptions:** B2B SaaS price elasticity is typically -0.4 to -0.6. We use -0.4 (inelastic demand given competitor pricing gap). A 20% price increase causes ~8% conversion decline; a 20% price decrease causes ~7.5% conversion lift.

**Recommendation:** Current pricing is well-positioned. A +20% increase on Agency and Brand Enterprise tiers only would yield the best risk-adjusted revenue gain, as those segments are least price-sensitive and most distant from competitor pricing.

### 4.3 Competitor Price Gap Analysis

| Competitor             | Entry Price | DealStage Equivalent    | Price Gap | Gap Multiple |
| ---------------------- | ----------- | ----------------------- | --------- | ------------ |
| Grin                   | $2,500/mo   | Brand Starter $299/mo   | $2,201    | 8.4x cheaper |
| AspireIQ               | $2,000/mo   | Brand Starter $299/mo   | $1,701    | 6.7x cheaper |
| CreatorIQ              | $3,000/mo   | Brand Growth $599/mo    | $2,401    | 5.0x cheaper |
| Upfluence              | $478/mo     | Brand Starter $299/mo   | $179      | 1.6x cheaper |
| Grin (vs. Agency)      | $2,500/mo   | Agency Starter $799/mo  | $1,701    | 3.1x cheaper |
| CreatorIQ (vs. Agency) | $3,000/mo   | Agency Growth $1,499/mo | $1,501    | 2.0x cheaper |

**Key Insight:** DealStage maintains a 2x-8x price advantage against all major competitors at comparable feature tiers. This provides substantial room for future price increases as the platform matures and feature parity strengthens. Even at +20% pricing, DealStage remains 1.3x-7x cheaper than competitors, suggesting the current pricing may be undervaluing the platform for brand and agency roles.

---

---

# DELIVERABLE 23: STARTUP BUDGET TRACKER (24-MONTH)

## Revenue Forecast Assumptions

| Phase            | Months | Target Total Users | Paid Conversion        | Monthly User Growth |
| ---------------- | ------ | ------------------ | ---------------------- | ------------------- |
| Beta/Soft Launch | 1-3    | 20 to 50           | 5% (mostly free trial) | 10-15 new/month     |
| Growth Phase     | 4-6    | 50 to 200          | 15%                    | 50 new/month        |
| Scale Phase      | 7-12   | 200 to 1,000       | 20%                    | 130 new/month       |
| Maturity Phase   | 13-24  | 1,000 to 5,000     | 25%                    | 330 new/month       |

**Role mix held constant:** 40% Talent, 30% Brand, 20% Agency, 10% Manager

**Blended ARPU for paid users:** $634.62 (from Deliverable 22 unit economics)

**Annual billing assumption:** 30% of paid users choose annual (10-month equivalent), reducing effective ARPU by ~6% blended. Adjusted paid ARPU: $596.54/month.

---

## Month-by-Month Budget: Months 1-6 (Beta + Early Growth)

### Month 1

| Category                 | Amount      | Notes                           |
| ------------------------ | ----------- | ------------------------------- |
| **REVENUE**              |             |                                 |
| Total Users              | 20          | Founders, beta testers, friends |
| Paid Users               | 1           | 5% conversion                   |
| MRR                      | $597        | 1 x $596.54 blended ARPU        |
|                          |             |                                 |
| **EXPENSES**             |             |                                 |
| Supabase Pro             | $25         |                                 |
| Vercel Pro               | $20         |                                 |
| Railway (Crawl4AI)       | $5          | Minimal usage                   |
| OpenAI API               | $50         | Minimum tier                    |
| Anthropic API            | $50         | Minimum tier                    |
| GrowMeOrganic            | $49         |                                 |
| Resend                   | $0          | Free tier                       |
| Sentry                   | $0          | Free tier                       |
| Domain/DNS               | $15         |                                 |
| Founder Salary           | $5,000      | Minimum draw                    |
| Marketing & Ads          | $500        | Organic focus, social media     |
| Legal & Compliance       | $250        | Entity maintenance              |
| Tools & Software         | $300        | GitHub, Figma, analytics        |
| Contingency (10%)        | $626        | 10% of total expenses           |
| **Total Expenses**       | **$6,890**  |                                 |
|                          |             |                                 |
| **Net Cash Flow**        | **-$6,293** |                                 |
| **Cumulative Cash Flow** | **-$6,293** |                                 |

### Month 2

| Category                     | Amount       |
| ---------------------------- | ------------ |
| **REVENUE**                  |              |
| Total Users                  | 30           |
| Paid Users                   | 2            |
| MRR                          | $1,193       |
| **EXPENSES**                 |              |
| Infrastructure (all)         | $164         |
| AI APIs (OpenAI + Anthropic) | $100         |
| Third-party services         | $64          |
| Founder Salary               | $5,000       |
| Marketing & Ads              | $750         |
| Legal & Compliance           | $250         |
| Tools & Software             | $300         |
| Contingency (10%)            | $663         |
| **Total Expenses**           | **$7,291**   |
| **Net Cash Flow**            | **-$6,098**  |
| **Cumulative Cash Flow**     | **-$12,391** |

### Month 3

| Category                 | Amount       |
| ------------------------ | ------------ |
| **REVENUE**              |              |
| Total Users              | 50           |
| Paid Users               | 3            |
| MRR                      | $1,790       |
| **EXPENSES**             |              |
| Infrastructure (all)     | $164         |
| AI APIs                  | $110         |
| Third-party services     | $64          |
| Founder Salary           | $5,000       |
| Marketing & Ads          | $1,000       |
| Legal & Compliance       | $250         |
| Tools & Software         | $300         |
| Contingency (10%)        | $689         |
| **Total Expenses**       | **$7,577**   |
| **Net Cash Flow**        | **-$5,787**  |
| **Cumulative Cash Flow** | **-$18,178** |

### Month 4

| Category                 | Amount       |
| ------------------------ | ------------ |
| **REVENUE**              |              |
| Total Users              | 100          |
| Paid Users               | 15           |
| MRR                      | $8,948       |
| **EXPENSES**             |              |
| Infrastructure (all)     | $164         |
| AI APIs                  | $150         |
| Third-party services     | $64          |
| Founder Salary           | $5,000       |
| Marketing & Ads          | $2,000       |
| Legal & Compliance       | $500         |
| Tools & Software         | $300         |
| Contingency (10%)        | $818         |
| **Total Expenses**       | **$8,996**   |
| **Net Cash Flow**        | **-$48**     |
| **Cumulative Cash Flow** | **-$18,226** |

### Month 5

| Category                 | Amount       |
| ------------------------ | ------------ |
| **REVENUE**              |              |
| Total Users              | 150          |
| Paid Users               | 23           |
| MRR                      | $13,720      |
| **EXPENSES**             |              |
| Infrastructure (all)     | $165         |
| AI APIs                  | $175         |
| Third-party services     | $64          |
| Founder Salary           | $5,000       |
| Marketing & Ads          | $2,500       |
| Legal & Compliance       | $500         |
| Tools & Software         | $300         |
| Contingency (10%)        | $870         |
| **Total Expenses**       | **$9,574**   |
| **Net Cash Flow**        | **+$4,146**  |
| **Cumulative Cash Flow** | **-$14,080** |

### Month 6

| Category                 | Amount      |
| ------------------------ | ----------- |
| **REVENUE**              |             |
| Total Users              | 200         |
| Paid Users               | 30          |
| MRR                      | $17,896     |
| **EXPENSES**             |             |
| Infrastructure (all)     | $168        |
| AI APIs                  | $200        |
| Third-party services     | $64         |
| Founder Salary           | $5,000      |
| Marketing & Ads          | $3,000      |
| Legal & Compliance       | $500        |
| Tools & Software         | $300        |
| Contingency (10%)        | $923        |
| **Total Expenses**       | **$10,155** |
| **Net Cash Flow**        | **+$7,741** |
| **Cumulative Cash Flow** | **-$6,339** |

---

## Month-by-Month Budget: Months 7-12 (Scale Phase)

### Month 7

| Category                   | Amount       |
| -------------------------- | ------------ |
| **REVENUE**                |              |
| Total Users                | 330          |
| Paid Users                 | 66           |
| MRR                        | $39,371      |
| **EXPENSES**               |              |
| Infrastructure             | $170         |
| AI APIs                    | $250         |
| Third-party services       | $64          |
| Founder Salary             | $5,000       |
| Part-time contractor (dev) | $3,000       |
| Marketing & Ads            | $5,000       |
| Legal & Compliance         | $500         |
| Tools & Software           | $400         |
| Contingency (10%)          | $1,438       |
| **Total Expenses**         | **$15,822**  |
| **Net Cash Flow**          | **+$23,549** |
| **Cumulative Cash Flow**   | **+$17,210** |

### Month 8

| Category                   | Amount       |
| -------------------------- | ------------ |
| **REVENUE**                |              |
| Total Users                | 460          |
| Paid Users                 | 92           |
| MRR                        | $54,882      |
| **EXPENSES**               |              |
| Infrastructure             | $172         |
| AI APIs                    | $300         |
| Third-party services       | $64          |
| Founder Salary             | $5,000       |
| Part-time contractor (dev) | $3,000       |
| Marketing & Ads            | $6,000       |
| Legal & Compliance         | $500         |
| Tools & Software           | $400         |
| Contingency (10%)          | $1,544       |
| **Total Expenses**         | **$16,980**  |
| **Net Cash Flow**          | **+$37,902** |
| **Cumulative Cash Flow**   | **+$55,112** |

### Month 9

| Category                   | Amount        |
| -------------------------- | ------------- |
| **REVENUE**                |               |
| Total Users                | 590           |
| Paid Users                 | 118           |
| MRR                        | $70,392       |
| **EXPENSES**               |               |
| Infrastructure             | $174          |
| AI APIs                    | $350          |
| Third-party services       | $64           |
| Founder Salary             | $7,000        |
| Part-time contractor (dev) | $3,000        |
| Customer success (PT)      | $2,000        |
| Marketing & Ads            | $7,000        |
| Legal & Compliance         | $750          |
| Tools & Software           | $500          |
| Contingency (10%)          | $2,084        |
| **Total Expenses**         | **$22,922**   |
| **Net Cash Flow**          | **+$47,470**  |
| **Cumulative Cash Flow**   | **+$102,582** |

### Month 10

| Category                 | Amount        |
| ------------------------ | ------------- |
| **REVENUE**              |               |
| Total Users              | 720           |
| Paid Users               | 144           |
| MRR                      | $85,902       |
| **EXPENSES**             |               |
| Infrastructure           | $175          |
| AI APIs                  | $400          |
| Third-party services     | $64           |
| Founder Salary           | $7,000        |
| Contractors (dev + CS)   | $5,000        |
| Marketing & Ads          | $8,000        |
| Legal & Compliance       | $750          |
| Tools & Software         | $500          |
| Contingency (10%)        | $2,189        |
| **Total Expenses**       | **$24,078**   |
| **Net Cash Flow**        | **+$61,824**  |
| **Cumulative Cash Flow** | **+$164,406** |

### Month 11

| Category                 | Amount        |
| ------------------------ | ------------- |
| **REVENUE**              |               |
| Total Users              | 860           |
| Paid Users               | 172           |
| MRR                      | $102,605      |
| **EXPENSES**             |               |
| Infrastructure           | $176          |
| AI APIs                  | $450          |
| Third-party services     | $64           |
| Founder Salary           | $7,000        |
| Contractors (dev + CS)   | $5,000        |
| Marketing & Ads          | $10,000       |
| Legal & Compliance       | $750          |
| Tools & Software         | $500          |
| Contingency (10%)        | $2,394        |
| **Total Expenses**       | **$26,334**   |
| **Net Cash Flow**        | **+$76,271**  |
| **Cumulative Cash Flow** | **+$240,677** |

### Month 12

| Category                 | Amount        |
| ------------------------ | ------------- |
| **REVENUE**              |               |
| Total Users              | 1,000         |
| Paid Users               | 200           |
| MRR                      | $119,308      |
| **EXPENSES**             |               |
| Infrastructure           | $178          |
| AI APIs                  | $500          |
| Third-party services     | $64           |
| Founder Salary           | $8,000        |
| Full-time engineer #1    | $10,000       |
| Customer success (FT)    | $4,000        |
| Marketing & Ads          | $12,000       |
| Legal & Compliance       | $1,000        |
| Tools & Software         | $600          |
| Contingency (10%)        | $3,634        |
| **Total Expenses**       | **$39,976**   |
| **Net Cash Flow**        | **+$79,332**  |
| **Cumulative Cash Flow** | **+$320,009** |

---

## Month-by-Month Budget: Months 13-24 (Maturity Phase)

### Month 13

| Category                 | Amount        |
| ------------------------ | ------------- |
| **REVENUE**              |               |
| Total Users              | 1,330         |
| Paid Users               | 333           |
| MRR                      | $198,653      |
| **EXPENSES**             |               |
| Infrastructure           | $185          |
| AI APIs                  | $650          |
| Third-party services     | $64           |
| Founder Salary           | $10,000       |
| Engineering (2 FTE)      | $20,000       |
| Customer Success (1 FTE) | $5,000        |
| Marketing & Ads          | $15,000       |
| Marketing hire (1 FTE)   | $6,000        |
| Legal & Compliance       | $1,500        |
| Tools & Software         | $800          |
| Office/Co-working        | $500          |
| Contingency (10%)        | $5,970        |
| **Total Expenses**       | **$65,669**   |
| **Net Cash Flow**        | **+$132,984** |
| **Cumulative Cash Flow** | **+$452,993** |

### Month 14

| Category                 | Amount        |
| ------------------------ | ------------- |
| Total Users              | 1,660         |
| Paid Users               | 415           |
| MRR                      | $247,564      |
| Total Expenses           | $70,200       |
| **Net Cash Flow**        | **+$177,364** |
| **Cumulative Cash Flow** | **+$630,357** |

### Month 15

| Category                 | Amount        |
| ------------------------ | ------------- |
| Total Users              | 1,990         |
| Paid Users               | 498           |
| MRR                      | $297,068      |
| Total Expenses           | $75,500       |
| **Net Cash Flow**        | **+$221,568** |
| **Cumulative Cash Flow** | **+$851,925** |

### Month 16

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 2,320           |
| Paid Users               | 580             |
| MRR                      | $345,993        |
| Total Expenses           | $82,000         |
| **Net Cash Flow**        | **+$263,993**   |
| **Cumulative Cash Flow** | **+$1,115,918** |

### Month 17

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 2,650           |
| Paid Users               | 663             |
| MRR                      | $395,507        |
| Total Expenses           | $90,000         |
| **Net Cash Flow**        | **+$305,507**   |
| **Cumulative Cash Flow** | **+$1,421,425** |

### Month 18

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 2,980           |
| Paid Users               | 745             |
| MRR                      | $444,422        |
| Total Expenses           | $100,000        |
| **Net Cash Flow**        | **+$344,422**   |
| **Cumulative Cash Flow** | **+$1,765,847** |

### Month 19

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 3,310           |
| Paid Users               | 828             |
| MRR                      | $493,936        |
| Total Expenses           | $110,000        |
| **Net Cash Flow**        | **+$383,936**   |
| **Cumulative Cash Flow** | **+$2,149,783** |

### Month 20

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 3,640           |
| Paid Users               | 910             |
| MRR                      | $542,851        |
| Total Expenses           | $120,000        |
| **Net Cash Flow**        | **+$422,851**   |
| **Cumulative Cash Flow** | **+$2,572,634** |

### Month 21

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 3,970           |
| Paid Users               | 993             |
| MRR                      | $592,364        |
| Total Expenses           | $130,000        |
| **Net Cash Flow**        | **+$462,364**   |
| **Cumulative Cash Flow** | **+$3,034,998** |

### Month 22

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 4,300           |
| Paid Users               | 1,075           |
| MRR                      | $641,279        |
| Total Expenses           | $140,000        |
| **Net Cash Flow**        | **+$501,279**   |
| **Cumulative Cash Flow** | **+$3,536,277** |

### Month 23

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 4,650           |
| Paid Users               | 1,163           |
| MRR                      | $693,778        |
| Total Expenses           | $150,000        |
| **Net Cash Flow**        | **+$543,778**   |
| **Cumulative Cash Flow** | **+$4,080,055** |

### Month 24

| Category                 | Amount          |
| ------------------------ | --------------- |
| Total Users              | 5,000           |
| Paid Users               | 1,250           |
| MRR                      | $745,678        |
| Total Expenses           | $160,000        |
| **Net Cash Flow**        | **+$585,678**   |
| **Cumulative Cash Flow** | **+$4,665,733** |

---

## 24-Month Summary Dashboard

### Revenue Milestones

| Milestone     | Month    | MRR      | ARR Equivalent |
| ------------- | -------- | -------- | -------------- |
| First Revenue | Month 1  | $597     | $7,164         |
| $10K MRR      | Month 5  | $13,720  | $164,640       |
| $50K MRR      | Month 8  | $54,882  | $658,584       |
| $100K MRR     | Month 12 | $119,308 | $1,431,696     |
| $250K MRR     | Month 14 | $247,564 | $2,970,768     |
| $500K MRR     | Month 19 | $493,936 | $5,927,232     |
| $750K MRR     | Month 24 | $745,678 | $8,948,136     |

### Expense Summary by Phase

| Phase              | Months | Avg Monthly Expense | Total Phase Expense | Primary Drivers                   |
| ------------------ | ------ | ------------------- | ------------------- | --------------------------------- |
| Beta               | 1-3    | $7,253              | $21,758             | Founder salary, infrastructure    |
| Growth             | 4-6    | $9,575              | $28,725             | Marketing ramp, first contractors |
| Scale              | 7-12   | $24,352             | $146,112            | First hires, marketing scale      |
| Maturity           | 13-24  | $107,781            | $1,293,369          | Team growth, enterprise readiness |
| **Total 24-Month** |        |                     | **$1,489,964**      |                                   |

### Cash Flow Summary

| Metric                         | Value              |
| ------------------------------ | ------------------ |
| Total 24-Month Revenue         | $6,155,697         |
| Total 24-Month Expenses        | $1,489,964         |
| Total 24-Month Net Cash Flow   | $4,665,733         |
| Lowest Cash Position           | -$18,226 (Month 4) |
| First Cash-Flow-Positive Month | Month 5            |
| Cumulative Break-Even Month    | Month 7            |
| Month 12 Cash Position         | $320,009           |
| Month 24 Cash Position         | $4,665,733         |

### Monthly Burn Rate Trajectory

| Period      | Avg Monthly Burn | Revenue Coverage     | Runway (if no revenue) |
| ----------- | ---------------- | -------------------- | ---------------------- |
| Month 1-3   | $7,253           | 16.5%                | N/A (need ~$22K seed)  |
| Month 4-6   | $9,575           | 142% (cash positive) | Infinite (profitable)  |
| Month 7-12  | $24,352          | 325%                 | Infinite               |
| Month 13-18 | $83,895          | 450%                 | Infinite               |
| Month 19-24 | $131,667         | 456%                 | Infinite               |

### Minimum Seed Capital Required

To cover the maximum cumulative deficit of -$18,226 (Month 4) plus 3 months safety buffer:

| Scenario                          | Amount      | Notes                                   |
| --------------------------------- | ----------- | --------------------------------------- |
| Minimum viable (exact break-even) | $18,226     | Covers deficit through Month 4          |
| Conservative (3-month buffer)     | $40,000     | Adds ~$22K runway cushion               |
| Comfortable (6-month buffer)      | $65,000     | Covers full pivot scenario              |
| **Recommended**                   | **$50,000** | Balances safety with capital efficiency |

### Path to Profitability

| Milestone                 | Month    | Metric                        |
| ------------------------- | -------- | ----------------------------- |
| First monthly profit      | Month 5  | +$4,146 net                   |
| Cumulative break-even     | Month 7  | $0 cumulative balance crossed |
| Sustainable profitability | Month 7+ | Never cash-negative again     |
| $100K monthly profit      | Month 13 | +$132,984 net                 |
| $500K monthly profit      | Month 23 | +$543,778 net                 |

---

---

# DELIVERABLE 24: SIGNING AUTHORITY MATRIX

## 1. Overview

This matrix defines approval authority for all financial commitments made by DealStage (PartnerIQ). It establishes clear decision-making boundaries, required documentation, and escalation paths to maintain financial discipline while enabling operational speed.

**Effective Date:** 2026-04-01
**Review Frequency:** Quarterly or upon any organizational structure change
**Applies To:** All persons authorized to commit DealStage funds

---

## 2. Approval Roles

| Role | Title              | Authority Level            | Notes                                                      |
| ---- | ------------------ | -------------------------- | ---------------------------------------------------------- |
| L1   | Founder/CEO        | Full operational authority | Solo decision-maker for all amounts under $10K             |
| L2   | Advisor(s)         | Advisory review            | Required co-review for $2K-$10K commitments                |
| L3   | Board of Directors | Governance approval        | Required for commitments exceeding $10K                    |
| L4   | Legal Counsel      | Compliance review          | Required for all contracts, equity, and regulatory matters |

---

## 3. Spending Tiers

### Tier 1: Under $500 -- Founder Auto-Approve

| Field                      | Detail                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| **Amount Range**           | $0.01 - $499.99                                                                                  |
| **Approver**               | L1 (Founder) -- auto-approved                                                                    |
| **Documentation Required** | Receipt or invoice; brief purpose note in expense tracker                                        |
| **Turnaround Time**        | Immediate (same day)                                                                             |
| **Examples**               | Software subscriptions, domain renewals, small ad spends, freelance micro-tasks, office supplies |
| **Audit Trail**            | Expense logged in financial tracker within 48 hours; receipt attached                            |
| **Monthly Aggregate Cap**  | $3,000 across all Tier 1 expenses; exceeding aggregate requires L2 review                        |

### Tier 2: $500 - $2,000 -- Founder Review Required

| Field                      | Detail                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Amount Range**           | $500.00 - $1,999.99                                                                                                                  |
| **Approver**               | L1 (Founder) -- active review and written approval                                                                                   |
| **Documentation Required** | Invoice/quote; written justification (1-2 sentences); vendor details; comparison with alternatives if new vendor                     |
| **Turnaround Time**        | 1-2 business days                                                                                                                    |
| **Examples**               | Monthly contractor payments, marketing campaign spend, conference tickets, legal document preparation, premium software annual plans |
| **Audit Trail**            | Approval noted in expense tracker with justification; filed in monthly expense report                                                |
| **Monthly Aggregate Cap**  | $8,000 across all Tier 2 expenses                                                                                                    |

### Tier 3: $2,000 - $10,000 -- Founder + Advisor Review

| Field                      | Detail                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Amount Range**           | $2,000.00 - $9,999.99                                                                                                                                                        |
| **Approver**               | L1 (Founder) + L2 (Advisor) co-review                                                                                                                                        |
| **Documentation Required** | Detailed proposal or SOW; ROI analysis or business justification; vendor comparison (minimum 2 quotes for services >$5K); contract terms summary; budget line item reference |
| **Turnaround Time**        | 3-5 business days                                                                                                                                                            |
| **Examples**               | Quarterly contractor engagements, marketing agency retainer, legal retainer setup, annual SaaS platform contracts, equipment purchases, security audit                       |
| **Audit Trail**            | Written advisor acknowledgment (email or Slack message sufficient); proposal document archived; approval chain documented                                                    |
| **Escalation**             | If advisor unavailable for 5+ business days, Founder may proceed with documented justification and retroactive review                                                        |

### Tier 4: Over $10,000 -- Board Approval

| Field                      | Detail                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Amount Range**           | $10,000.00+                                                                                                                                                                                 |
| **Approver**               | L1 (Founder) + L3 (Board) formal approval                                                                                                                                                   |
| **Documentation Required** | Full business case with financial projections; 3+ vendor quotes (for services); Contract review by L4 (Legal); Board resolution or written consent; Impact analysis on runway and cash flow |
| **Turnaround Time**        | 5-10 business days                                                                                                                                                                          |
| **Examples**               | Full-time employee offers, major vendor contracts, office lease, significant marketing campaigns, M&A due diligence, fundraising-related legal costs                                        |
| **Audit Trail**            | Board meeting minutes or written consent; all supporting documents archived; decision recorded in corporate records                                                                         |

---

## 4. Category-Specific Authority

### 4.1 Infrastructure Contracts

| Commitment Type              | Amount Range          | Approver                | Documentation                                                 | Turnaround |
| ---------------------------- | --------------------- | ----------------------- | ------------------------------------------------------------- | ---------- |
| Monthly SaaS tool (new)      | Under $500            | L1                      | Receipt + purpose note                                        | Same day   |
| Monthly SaaS tool (new)      | $500-$2K              | L1                      | Justification + alternative comparison                        | 1-2 days   |
| Annual SaaS contract         | Any                   | L1 + L2 (if >$2K total) | ROI analysis, cancellation terms, data portability assessment | 3-5 days   |
| Cloud infrastructure upgrade | Under $2K/mo increase | L1                      | Capacity analysis showing need                                | 1-2 days   |
| Cloud infrastructure upgrade | $2K+/mo increase      | L1 + L2                 | Load testing data, cost projection, scaling plan              | 3-5 days   |
| API provider change          | Any                   | L1 + L4                 | Migration plan, data handling review, DPA review              | 5-10 days  |

### 4.2 Marketing Spend

| Commitment Type        | Amount Range        | Approver          | Documentation                                            | Turnaround |
| ---------------------- | ------------------- | ----------------- | -------------------------------------------------------- | ---------- |
| Social media ad spend  | Under $500/campaign | L1                | Campaign brief, target audience                          | Same day   |
| Social media ad spend  | $500-$2K/campaign   | L1                | Campaign brief, expected ROI, A/B test plan              | 1-2 days   |
| Influencer partnership | Under $2K           | L1                | Contract terms, deliverables, audience data              | 1-2 days   |
| Influencer partnership | $2K-$10K            | L1 + L2           | Full campaign proposal, ROI model, contract review       | 3-5 days   |
| Agency retainer        | Any                 | L1 + L2 (if >$2K) | Scope of work, KPIs, termination terms, 2+ agency quotes | 3-5 days   |
| Event sponsorship      | Under $5K           | L1 + L2           | Event details, expected lead generation, brand alignment | 3-5 days   |
| Event sponsorship      | $5K+                | L1 + L2 + L3      | Full sponsorship proposal, ROI projection                | 5-10 days  |
| Content production     | Under $1K           | L1                | Brief, deliverables list                                 | Same day   |
| Content production     | $1K+                | L1 + L2 (if >$2K) | Production plan, distribution strategy                   | 1-5 days   |

### 4.3 Vendor Agreements

| Commitment Type           | Amount Range | Approver     | Documentation                                           | Turnaround |
| ------------------------- | ------------ | ------------ | ------------------------------------------------------- | ---------- |
| One-time service purchase | Under $500   | L1           | Invoice + scope                                         | Same day   |
| One-time service purchase | $500-$2K     | L1           | SOW, deliverables, payment terms                        | 1-2 days   |
| Recurring vendor contract | Under $2K/mo | L1           | Contract terms, cancellation policy, data handling      | 1-2 days   |
| Recurring vendor contract | $2K-$10K/mo  | L1 + L2      | Full contract review, 2+ vendor comparison, SLA terms   | 3-5 days   |
| Recurring vendor contract | $10K+/mo     | L1 + L2 + L3 | Board approval, legal review, financial impact analysis | 5-10 days  |
| Data provider agreement   | Any          | L1 + L4      | DPA review, data handling assessment, compliance check  | 5-10 days  |

### 4.4 Employee Compensation

| Commitment Type                    | Approver     | Documentation                                                                            | Turnaround |
| ---------------------------------- | ------------ | ---------------------------------------------------------------------------------------- | ---------- |
| Freelance/contractor (<$2K/mo)     | L1           | Scope of work, rate card, independent contractor agreement                               | 1-2 days   |
| Freelance/contractor ($2K-$10K/mo) | L1 + L2      | SOW, rate benchmarking, budget impact analysis                                           | 3-5 days   |
| Part-time employee offer           | L1 + L2      | Offer letter, compensation benchmarking, budget impact                                   | 3-5 days   |
| Full-time employee offer           | L1 + L2 + L3 | Offer letter, comp benchmarking, equity component, 12-month budget impact, board consent | 5-10 days  |
| Salary increase (existing)         | L1 + L2      | Performance review, market comp data, budget impact                                      | 3-5 days   |
| Bonus payment (<$2K)               | L1           | Performance justification                                                                | 1-2 days   |
| Bonus payment ($2K+)               | L1 + L2      | Performance metrics, budget impact                                                       | 3-5 days   |

### 4.5 Legal Fees

| Commitment Type                        | Amount Range | Approver          | Documentation                                                                   | Turnaround |
| -------------------------------------- | ------------ | ----------------- | ------------------------------------------------------------------------------- | ---------- |
| Standard legal review                  | Under $500   | L1                | Engagement letter, scope                                                        | Same day   |
| Contract drafting/review               | $500-$2K     | L1                | Engagement letter, scope, fixed-fee confirmation                                | 1-2 days   |
| IP filing (trademark, patent)          | $2K-$10K     | L1 + L2           | Filing strategy, jurisdiction, maintenance cost projection                      | 3-5 days   |
| Litigation/dispute                     | Any          | L1 + L2 + L3 + L4 | Full case assessment, risk analysis, cost estimate, settlement authority limits | 5-10 days  |
| Regulatory compliance                  | Any          | L1 + L4           | Compliance gap analysis, remediation plan                                       | 3-5 days   |
| Fundraising legal (SAFE, priced round) | Any          | L1 + L2 + L3      | Engagement letter, deal terms, fee cap, board consent                           | 5-10 days  |

### 4.6 Equity Grants

| Commitment Type                     | Approver     | Documentation                                                                            | Turnaround |
| ----------------------------------- | ------------ | ---------------------------------------------------------------------------------------- | ---------- |
| Advisor equity grant (<1%)          | L1 + L2      | Advisor agreement, vesting schedule, 409A valuation reference, cap table impact          | 5-10 days  |
| Employee option grant               | L1 + L2 + L3 | Board consent, option agreement, strike price (409A), vesting schedule, cap table impact | 5-10 days  |
| Founder share transfer/modification | L3 (Board)   | Board resolution, updated cap table, legal review, shareholder consent if required       | 10-15 days |
| ESOP pool creation or increase      | L3 (Board)   | Board resolution, pool size justification, dilution analysis, shareholder consent        | 10-15 days |

---

## 5. Emergency Spending Authority

| Scenario                                  | Authority               | Cap     | Post-Event Requirement                                                                            |
| ----------------------------------------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Critical security incident                | L1 (Founder) unilateral | $5,000  | Full incident report + expense justification within 48 hours; L2 retroactive review within 5 days |
| Service outage (revenue impact)           | L1 (Founder) unilateral | $3,000  | Incident post-mortem within 72 hours; expense documentation                                       |
| Legal emergency (cease & desist, lawsuit) | L1 (Founder) unilateral | $10,000 | L2 + L4 review within 48 hours; Board notification within 5 days                                  |
| Data breach response                      | L1 (Founder) unilateral | $10,000 | Full breach report per regulatory requirements; Board notification within 24 hours                |

---

## 6. Approval Workflow Process

### Step 1: Request Initiation

- Requestor completes expense request with: amount, category, vendor, business justification, budget line item reference, and urgency level

### Step 2: Tier Determination

- Amount determines approval tier per Section 3
- Category-specific rules (Section 4) may require additional approvers regardless of amount

### Step 3: Documentation Assembly

- All required documents per tier and category are assembled before routing for approval

### Step 4: Approval Routing

- Tier 1: Auto-logged, no routing needed
- Tier 2: Founder reviews within 1-2 business days
- Tier 3: Founder reviews, then routes to Advisor with full documentation
- Tier 4: Founder reviews, routes to Advisor, then schedules Board review

### Step 5: Execution

- Upon approval, payment is authorized
- Receipt/confirmation is logged
- Expense tracker updated within 48 hours

### Step 6: Monthly Reconciliation

- All expenses reconciled against approved amounts
- Variances >10% flagged for review
- Monthly expense report generated for L1/L2 review

---

---

# DELIVERABLE 25: FUNDRAISING READINESS CHECKLIST

## 1. Documentation Readiness Tracker

### 1.1 Core Investor Documents

| Document                           | Status      | Owner           | Target Date | Notes                                                  |
| ---------------------------------- | ----------- | --------------- | ----------- | ------------------------------------------------------ |
| **Pitch Deck (15-20 slides)**      | Not Started | Founder         | Month 3     | Key slides below                                       |
| **Executive Summary (2-page)**     | Not Started | Founder         | Month 3     | One-pager for cold outreach                            |
| **Financial Model**                | Complete    | Founder         | --          | See Deliverable 22 (Pricing Model Calculator)          |
| **24-Month Budget**                | Complete    | Founder         | --          | See Deliverable 23 (Startup Budget Tracker)            |
| **Product Demo Script (5 min)**    | Not Started | Founder         | Month 2     | Live demo flow + backup video                          |
| **Product Demo Video (3 min)**     | Not Started | Founder         | Month 3     | Narrated screen recording                              |
| **Customer Traction Deck**         | Not Started | Founder         | Month 4     | Requires live user data                                |
| **Team Bios + LinkedIn**           | Not Started | Founder         | Month 2     | Founder + advisors                                     |
| **Cap Table**                      | Complete    | Founder         | --          | See Deliverable 26                                     |
| **Legal Entity Docs**              | In Progress | Founder + Legal | Month 2     | Certificate of incorporation, EIN, operating agreement |
| **IP Assignment Agreement**        | Not Started | Legal           | Month 2     | Assigns all IP to PartnerIQ entity                     |
| **Invention Assignment Agreement** | Not Started | Legal           | Month 2     | For all contributors/contractors                       |
| **Data Room (virtual)**            | Not Started | Founder         | Month 3     | Organized folder structure per Section 4               |

### 1.2 Pitch Deck Key Slides

| Slide # | Title                 | Content                                                                                                                                          |
| ------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1       | Cover                 | DealStage logo, tagline ("AI-Powered Partnership Intelligence"), URL                                                                             |
| 2       | Problem               | $21B influencer marketing market fragmented; brands waste 60% of partnership spend on poor matches; existing tools cost $2,500-$3,000/mo         |
| 3       | Solution              | AI matching engine across 140+ talent types; 30+ AI agents automate discovery, outreach, negotiation, and analytics                              |
| 4       | Product Demo          | 4 annotated screenshots: discovery, AI match, deal flow, analytics                                                                               |
| 5       | Market Size           | TAM: $21B (influencer marketing) + $15B (talent management) = $36B; SAM: $5.2B (SMB/mid-market digital partnerships); SOM: $52M (1% SAM, Year 3) |
| 6       | Business Model        | 5 roles x 4 tiers; freemium with 7-day reverse trial; ARR path to $9M by Month 24                                                                |
| 7       | Traction              | User count, MRR, growth rate, engagement metrics (AI queries as proxy), deals facilitated                                                        |
| 8       | Technology            | Dual AI (Claude Sonnet 4 + GPT-4o-mini); Supabase + Vercel; 30+ AI agents; 44,847 contact database                                               |
| 9       | Competitive Landscape | 2x2 matrix: Price (low/high) vs. Feature breadth (narrow/broad); DealStage in low-price/broad-feature quadrant                                   |
| 10      | Competitive Advantage | 5-8x cheaper than competitors; multi-role platform (not brand-only); AI-native architecture; 140+ talent types vs. competitors' 3-5              |
| 11      | Go-to-Market          | Product-led growth; freemium funnel; content marketing; agency/manager network effects                                                           |
| 12      | Unit Economics        | 96%+ gross margins; $635 ARPU (paid); break-even at 28 users; LTV:CAC target >5:1                                                                |
| 13      | Financial Projections | Month 12: $119K MRR; Month 24: $746K MRR; path to profitability Month 5                                                                          |
| 14      | Team                  | Founder background; advisor roster; key hires planned                                                                                            |
| 15      | The Ask               | Raise amount, use of funds, timeline, terms (SAFE preferred)                                                                                     |
| 16      | Appendix              | Detailed financial tables, product roadmap, testimonials                                                                                         |

### 1.3 Legal Readiness

| Item                                 | Status      | Owner         | Target Date | Notes                                                     |
| ------------------------------------ | ----------- | ------------- | ----------- | --------------------------------------------------------- |
| Delaware C-Corp (or LLC) formation   | Verify      | Legal         | Month 1     | Required for institutional investors                      |
| EIN obtained                         | Verify      | Founder       | Month 1     |                                                           |
| Operating Agreement / Bylaws         | Verify      | Legal         | Month 1     |                                                           |
| 83(b) Election filed (if applicable) | Verify      | Founder + Tax | Month 1     | Must file within 30 days of restricted stock grant        |
| IP Assignment (founder to company)   | Not Started | Legal         | Month 2     | Critical -- all code, designs, data must be company-owned |
| Contractor IP assignments            | Not Started | Legal         | Month 2     | For all past and current contractors                      |
| Terms of Service (live)              | In Progress | Legal         | Month 2     |                                                           |
| Privacy Policy (live)                | In Progress | Legal         | Month 2     |                                                           |
| SAFE template prepared               | Not Started | Legal         | Month 3     | YC standard SAFE recommended                              |
| Board consent template               | Not Started | Legal         | Month 3     | For authorizing SAFE issuance                             |

---

## 2. Metrics Dashboard for Investor Readiness

### 2.1 Revenue and Growth Metrics

| Metric                | Definition                                                      | Target (Pre-Seed) | Target (Seed) | Current Value |
| --------------------- | --------------------------------------------------------------- | ----------------- | ------------- | ------------- |
| MRR                   | Monthly recurring revenue                                       | $5K-$20K          | $50K-$150K    | Pre-launch    |
| ARR                   | MRR x 12                                                        | $60K-$240K        | $600K-$1.8M   | Pre-launch    |
| MRR Growth Rate (MoM) | (Current MRR - Prior MRR) / Prior MRR                           | 15-30%            | 15-25%        | N/A           |
| Net Revenue Retention | (Starting MRR + Expansion - Contraction - Churn) / Starting MRR | >90%              | >100%         | N/A           |
| Revenue per Employee  | ARR / FTE count                                                 | >$200K            | >$300K        | N/A           |

### 2.2 User and Engagement Metrics

| Metric                      | Definition                            | Target (Pre-Seed) | Target (Seed) | Current Value |
| --------------------------- | ------------------------------------- | ----------------- | ------------- | ------------- |
| Total Registered Users      | All accounts created                  | 50-200            | 500-2,000     | Pre-launch    |
| Monthly Active Users (MAU)  | Users with 1+ session in 30 days      | 30-100            | 300-1,000     | Pre-launch    |
| DAU/MAU Ratio               | Daily active / monthly active         | >15%              | >20%          | N/A           |
| AI Query Volume (monthly)   | Total AI agent interactions           | 500-5,000         | 10,000-50,000 | Pre-launch    |
| Avg Queries per Active User | AI queries / MAU                      | >5                | >10           | N/A           |
| Feature Adoption Rate       | Users using 3+ features / total users | >30%              | >50%          | N/A           |

### 2.3 Conversion and Monetization Metrics

| Metric                              | Definition                      | Target (Pre-Seed) | Target (Seed) | Current Value |
| ----------------------------------- | ------------------------------- | ----------------- | ------------- | ------------- |
| Free-to-Paid Conversion             | Paid users / total users        | 5-15%             | 15-25%        | N/A           |
| Trial-to-Paid (7-day reverse trial) | Users converting after trial    | >10%              | >20%          | N/A           |
| ARPU (all users)                    | MRR / total users               | >$50              | >$100         | N/A           |
| ARPU (paid only)                    | MRR / paid users                | >$300             | >$500         | N/A           |
| Expansion Revenue %                 | Upgrade revenue / total revenue | >5%               | >15%          | N/A           |

### 2.4 Customer Acquisition Metrics

| Metric               | Definition                                   | Target (Pre-Seed) | Target (Seed) | Current Value |
| -------------------- | -------------------------------------------- | ----------------- | ------------- | ------------- |
| CAC (blended)        | Total marketing spend / new paid users       | <$200             | <$500         | N/A           |
| CAC (paid channels)  | Paid marketing spend / attributed paid users | <$500             | <$1,000       | N/A           |
| LTV (12-month)       | ARPU x 12 x (1 - monthly churn)              | >$3,000           | >$6,000       | N/A           |
| LTV:CAC Ratio        | LTV / CAC                                    | >3:1              | >5:1          | N/A           |
| Payback Period       | CAC / monthly ARPU                           | <6 months         | <8 months     | N/A           |
| Organic vs. Paid Mix | % of signups from organic channels           | >60%              | >50%          | N/A           |

### 2.5 Retention and Churn Metrics

| Metric                | Definition                                   | Target (Pre-Seed) | Target (Seed)  | Current Value |
| --------------------- | -------------------------------------------- | ----------------- | -------------- | ------------- |
| Monthly Logo Churn    | Churned accounts / starting accounts         | <8%               | <5%            | N/A           |
| Monthly Revenue Churn | Churned MRR / starting MRR                   | <6%               | <4%            | N/A           |
| Net Revenue Churn     | (Churned MRR - Expansion MRR) / starting MRR | <3%               | <0% (negative) | N/A           |
| 30-Day Retention      | Users active at Day 30 / users signed up     | >40%              | >55%           | N/A           |
| 90-Day Retention      | Users active at Day 90 / users signed up     | >25%              | >40%           | N/A           |
| NPS Score             | Net Promoter Score from in-app survey        | >20               | >40            | N/A           |

### 2.6 Deal Flow Metrics (Platform-Specific)

| Metric                    | Definition                                | Target (Pre-Seed) | Target (Seed) |
| ------------------------- | ----------------------------------------- | ----------------- | ------------- |
| Deals Created (monthly)   | New partnership deals initiated           | 50-200            | 500-2,000     |
| Deals Completed (monthly) | Deals reaching "closed" status            | 10-50             | 100-500       |
| Avg Deal Value            | Revenue associated with completed deals   | Track only        | >$1,000       |
| Time to First Deal        | Days from signup to first deal created    | <7 days           | <3 days       |
| Match Acceptance Rate     | Accepted AI matches / total matches shown | >20%              | >35%          |
| Platform GMV              | Total value of deals facilitated          | Track only        | >$100K/mo     |

---

## 3. Investor Targeting Strategy

### 3.1 Investor Type Fit

| Stage        | Investor Type                      | Typical Check Size | Fund Size      | Fit Score (1-5) |
| ------------ | ---------------------------------- | ------------------ | -------------- | --------------- |
| **Pre-Seed** | Angel investors (individual)       | $10K-$50K          | Personal       | 5               |
| **Pre-Seed** | Angel syndicates (AngelList, etc.) | $50K-$250K         | Syndicate pool | 5               |
| **Pre-Seed** | Pre-seed funds                     | $100K-$500K        | $10M-$50M      | 4               |
| **Pre-Seed** | Accelerators (YC, Techstars, etc.) | $125K-$500K        | Program fund   | 5               |
| **Seed**     | Seed-stage VC                      | $500K-$2M          | $50M-$200M     | 4               |
| **Seed**     | Strategic investors (Stripe, etc.) | $250K-$1M          | Corporate      | 3               |
| **Seed**     | Family offices                     | $100K-$500K        | Varies         | 3               |

### 3.2 Target Investor Profile

| Attribute                 | Ideal Investor                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| **Sector focus**          | Creator economy, influencer marketing, SaaS, marketplace, AI/ML                                    |
| **Stage focus**           | Pre-seed or seed                                                                                   |
| **Portfolio companies**   | Grin, AspireIQ, CreatorIQ, Upfluence competitors OR complementary tools (CRM, analytics, payments) |
| **Check size**            | $100K-$500K (pre-seed), $500K-$2M (seed)                                                           |
| **Geographic preference** | US-based or remote-friendly                                                                        |
| **Value-add**             | GTM introductions to brands/agencies, talent network access, SaaS scaling expertise                |

### 3.3 Target Investor List Structure

| #   | Investor Name | Type          | Check Size | Sector Fit      | Portfolio Overlap | Contact Method | Status      |
| --- | ------------- | ------------- | ---------- | --------------- | ----------------- | -------------- | ----------- |
| 1   | [Name]        | Angel         | $25K       | Creator economy | None              | Warm intro     | Not started |
| 2   | [Name]        | Pre-seed fund | $200K      | SaaS + AI       | [Company]         | Cold email     | Not started |
| ... | ...           | ...           | ...        | ...             | ...               | ...            | ...         |

_Populate with 30-50 target investors before beginning outreach._

### 3.4 Outreach Cadence

| Step | Timing        | Channel                       | Content                                          |
| ---- | ------------- | ----------------------------- | ------------------------------------------------ |
| 1    | Week 0        | Warm intro or cold email      | Executive summary (2-page) + 1-line ask          |
| 2    | Week 0+3 days | Follow-up email               | If no response; add a traction data point        |
| 3    | Week 1        | First meeting (15-30 min)     | Elevator pitch + product demo                    |
| 4    | Week 1-2      | Send pitch deck               | Full deck after first meeting interest confirmed |
| 5    | Week 2-3      | Deep dive meeting (45-60 min) | Financial model walkthrough + Q&A                |
| 6    | Week 3-4      | Data room access              | Full documentation per Section 4                 |
| 7    | Week 4-5      | Term negotiation              | SAFE terms, valuation cap, discount              |
| 8    | Week 5-6      | Close                         | Signed SAFE, wire transfer                       |

### 3.5 Cold Email Template

**Subject:** DealStage -- AI partnership platform, 8x cheaper than Grin, {MRR} MRR

**Body:**

Hi {First Name},

I'm building DealStage, an AI-powered partnership platform that connects brands with 140+ types of talent -- from influencers to athletes to actors -- at a fraction of the cost of existing tools.

Quick numbers:

- {MRR} MRR, {growth_rate}% MoM growth
- {user_count} users across {paid_count} paid accounts
- 96%+ gross margins, profitable since Month 5
- 5-8x cheaper than Grin ($2,500/mo), AspireIQ ($2,000/mo), CreatorIQ ($3,000/mo)

We're raising a ${amount} pre-seed round on a SAFE with a ${valuation_cap} cap to accelerate go-to-market and hire our first engineer.

Would you have 15 minutes this week for a quick demo? I'd love your perspective on the creator economy infrastructure space.

Best,
{Founder Name}
{Title}, DealStage
thedealstage.com

---

## 4. Data Room Organization

### Virtual Data Room Folder Structure

```
/DealStage Data Room/
|
|-- /01-Company Overview/
|   |-- Executive Summary (2-page).pdf
|   |-- Pitch Deck.pdf
|   |-- Product Demo Video.mp4
|   |-- Company Fact Sheet.pdf
|
|-- /02-Financial/
|   |-- Financial Model (Deliverable 22).xlsx
|   |-- 24-Month Budget (Deliverable 23).xlsx
|   |-- Monthly Financial Statements/ (when available)
|   |-- Revenue Receipts (Stripe dashboard export)
|   |-- Bank Statements (last 3 months)
|
|-- /03-Product/
|   |-- Product Screenshots/
|   |-- Architecture Diagram.pdf
|   |-- AI Agent Documentation.pdf
|   |-- Roadmap (12-month).pdf
|   |-- Database Schema Overview.pdf
|
|-- /04-Traction/
|   |-- User Metrics Dashboard (monthly snapshots)
|   |-- MRR Chart.pdf
|   |-- Cohort Analysis.xlsx
|   |-- Customer Testimonials/
|   |-- Case Studies/
|
|-- /05-Legal/
|   |-- Certificate of Incorporation.pdf
|   |-- Operating Agreement or Bylaws.pdf
|   |-- EIN Letter.pdf
|   |-- IP Assignment Agreement.pdf
|   |-- Contractor IP Assignments/
|   |-- Terms of Service.pdf
|   |-- Privacy Policy.pdf
|   |-- SAFE Template (YC standard).pdf
|
|-- /06-Cap Table/
|   |-- Cap Table (Deliverable 26).xlsx
|   |-- SAFE/Note Summary (if any outstanding)
|   |-- 409A Valuation (when obtained)
|   |-- Option Grant Ledger.xlsx
|
|-- /07-Team/
|   |-- Founder Bio + Resume.pdf
|   |-- Advisor Agreements/
|   |-- Organizational Chart.pdf
|   |-- Key Hire Plan.pdf
|
|-- /08-Market/
|   |-- Market Size Analysis.pdf
|   |-- Competitive Analysis.pdf
|   |-- Industry Reports/
```

---

## 5. Fundraising Timeline

| Week       | Activity                                     | Deliverable                         |
| ---------- | -------------------------------------------- | ----------------------------------- |
| Week 1-2   | Finalize all documents (Section 1)           | Complete data room                  |
| Week 3-4   | Build target investor list (30-50 names)     | Investor CRM populated              |
| Week 5     | Begin warm intro outreach (top 10 investors) | 10 intros requested                 |
| Week 6-7   | First meetings (target 5-8 meetings/week)    | Meeting notes, follow-up deck sends |
| Week 8-9   | Deep dive meetings with interested investors | Financial model walkthroughs        |
| Week 10-11 | Term sheet / SAFE negotiation                | Signed terms                        |
| Week 12    | Close and wire                               | Funds in bank                       |

**Target timeline: 12 weeks from preparation start to close.**

---

---

# DELIVERABLE 26: CAP TABLE TEMPLATE

## 1. Initial Setup -- Pre-Funding

### 1.1 Authorized Share Structure

| Parameter                   | Value                         | Notes                                                        |
| --------------------------- | ----------------------------- | ------------------------------------------------------------ |
| **Entity Type**             | Delaware C-Corp (recommended) | Required for institutional VC; convert from LLC if needed    |
| **Total Authorized Shares** | 10,000,000                    | Standard for early-stage; provides room for future issuances |
| **Par Value**               | $0.0001/share                 | Standard nominal par value                                   |
| **Share Class**             | Common Stock                  | Single class at founding; preferred created at priced round  |

### 1.2 Current Cap Table (Pre-Funding, Single Founder)

| Shareholder                 | Role     | Shares         | % Ownership | Vesting               | Cliff         | Notes                                            |
| --------------------------- | -------- | -------------- | ----------- | --------------------- | ------------- | ------------------------------------------------ |
| Founder (CEO)               | Founder  | 7,500,000      | 75.0%       | 4-year, monthly       | 1-year        | Standard single-trigger acceleration recommended |
| Advisor Pool (unallocated)  | Reserved | 500,000        | 5.0%        | Per advisor agreement | Per agreement | Granted as advisors join                         |
| Employee Option Pool (ESOP) | Reserved | 2,000,000      | 20.0%       | Per grant agreement   | Per grant     | Available for early hires and key contributors   |
| **Total Issued + Reserved** |          | **10,000,000** | **100.0%**  |                       |               |                                                  |

### 1.3 Founder Vesting Schedule Detail

| Parameter                 | Value                                                   |
| ------------------------- | ------------------------------------------------------- |
| Total Shares              | 7,500,000                                               |
| Vesting Period            | 48 months                                               |
| Cliff                     | 12 months (25% vests at cliff)                          |
| Post-Cliff Vesting        | 1/48th per month                                        |
| Vesting Start Date        | Company formation date                                  |
| Acceleration              | Single-trigger on change of control (100% acceleration) |
| Shares Vested at Month 0  | 0 (all subject to vesting)                              |
| Shares Vested at Month 12 | 1,875,000 (25%)                                         |
| Shares Vested at Month 24 | 3,750,000 (50%)                                         |
| Shares Vested at Month 36 | 5,625,000 (75%)                                         |
| Shares Vested at Month 48 | 7,500,000 (100%)                                        |

**Important:** File 83(b) election with the IRS within 30 days of restricted stock grant to avoid future tax liability on appreciation.

### 1.4 Advisor Pool Guidelines

| Parameter                                  | Value                                                      |
| ------------------------------------------ | ---------------------------------------------------------- |
| Total Reserved                             | 500,000 shares (5.0%)                                      |
| Standard Advisor Grant                     | 0.25% - 1.0% (25,000 - 100,000 shares)                     |
| Vesting                                    | 2-year monthly vesting, no cliff (standard FAST agreement) |
| Trigger                                    | Advisory agreement execution                               |
| Typical allocation per level               |                                                            |
| -- Light advisor (monthly call)            | 0.25% (25,000 shares)                                      |
| -- Standard advisor (bi-weekly engagement) | 0.50% (50,000 shares)                                      |
| -- Heavy advisor (weekly, strategic)       | 1.00% (100,000 shares)                                     |
| Maximum advisors at standard               | 5-10 advisors using 2.5% - 5.0% of pool                    |

### 1.5 Employee Option Pool (ESOP) Guidelines

| Parameter        | Value                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Total Reserved   | 2,000,000 shares (20.0%)                                                                       |
| Grant Type       | Incentive Stock Options (ISO) for employees; Non-Qualified Stock Options (NSO) for contractors |
| Strike Price     | Fair market value at grant date (409A valuation required)                                      |
| Standard Vesting | 4-year monthly vesting, 1-year cliff                                                           |
| Exercise Window  | 90 days post-termination (consider extending to 10 years for early employees)                  |
| Early Exercise   | Allow with 83(b) election (recommended for pre-seed employees)                                 |

**Recommended Grant Ranges by Role:**

| Role                                    | Equity Range (%) | Shares            | Notes                                    |
| --------------------------------------- | ---------------- | ----------------- | ---------------------------------------- |
| VP/Head of Engineering (first eng hire) | 2.0% - 4.0%      | 200,000 - 400,000 | Highest grant for first technical leader |
| Senior Engineer (#1-3)                  | 0.5% - 1.5%      | 50,000 - 150,000  | Early employees get larger grants        |
| Engineer (#4-10)                        | 0.25% - 0.75%    | 25,000 - 75,000   |                                          |
| Head of Marketing                       | 1.0% - 2.0%      | 100,000 - 200,000 |                                          |
| Head of Sales                           | 1.0% - 2.0%      | 100,000 - 200,000 |                                          |
| Customer Success Lead                   | 0.5% - 1.0%      | 50,000 - 100,000  |                                          |
| Designer                                | 0.25% - 0.75%    | 25,000 - 75,000   |                                          |
| Operations/Admin                        | 0.10% - 0.25%    | 10,000 - 25,000   |                                          |

---

## 2. Post-Seed Scenario Modeling

### 2.1 Scenario A: $2M Pre-Money Valuation, $250K Raise

| Shareholder     | Pre-Round Shares | Pre-Round % | Post-Round Shares | Post-Round % | Dilution |
| --------------- | ---------------- | ----------- | ----------------- | ------------ | -------- |
| Founder         | 7,500,000        | 75.0%       | 7,500,000         | 66.7%        | -8.3%    |
| Advisor Pool    | 500,000          | 5.0%        | 500,000           | 4.4%         | -0.6%    |
| ESOP            | 2,000,000        | 20.0%       | 2,000,000         | 17.8%        | -2.2%    |
| **Investor(s)** | **0**            | **0%**      | **1,250,000**     | **11.1%**    | **--**   |
| **Total**       | **10,000,000**   | **100%**    | **11,250,000**    | **100%**     |          |

_Calculation: $250K / $2M pre-money = 12.5% on pre-money basis. New shares = 10,000,000 x (250K / 2,000K) = 1,250,000. Post-money = $2.25M. Price/share = $0.20._

### 2.2 Scenario B: $5M Pre-Money Valuation, $500K Raise

| Shareholder     | Pre-Round Shares | Pre-Round % | Post-Round Shares | Post-Round % | Dilution |
| --------------- | ---------------- | ----------- | ----------------- | ------------ | -------- |
| Founder         | 7,500,000        | 75.0%       | 7,500,000         | 68.2%        | -6.8%    |
| Advisor Pool    | 500,000          | 5.0%        | 500,000           | 4.5%         | -0.5%    |
| ESOP            | 2,000,000        | 20.0%       | 2,000,000         | 18.2%        | -1.8%    |
| **Investor(s)** | **0**            | **0%**      | **1,000,000**     | **9.1%**     | **--**   |
| **Total**       | **10,000,000**   | **100%**    | **11,000,000**    | **100%**     |          |

_Calculation: $500K / $5M pre-money = 10%. New shares = 10,000,000 x (500K / 5,000K) = 1,000,000. Post-money = $5.5M. Price/share = $0.50._

### 2.3 Scenario C: $5M Pre-Money Valuation, $1M Raise

| Shareholder     | Pre-Round Shares | Pre-Round % | Post-Round Shares | Post-Round % | Dilution |
| --------------- | ---------------- | ----------- | ----------------- | ------------ | -------- |
| Founder         | 7,500,000        | 75.0%       | 7,500,000         | 62.5%        | -12.5%   |
| Advisor Pool    | 500,000          | 5.0%        | 500,000           | 4.2%         | -0.8%    |
| ESOP            | 2,000,000        | 20.0%       | 2,000,000         | 16.7%        | -3.3%    |
| **Investor(s)** | **0**            | **0%**      | **2,000,000**     | **16.7%**    | **--**   |
| **Total**       | **10,000,000**   | **100%**    | **12,000,000**    | **100%**     |          |

_Calculation: $1M / $5M pre-money = 20%. New shares = 10,000,000 x (1,000K / 5,000K) = 2,000,000. Post-money = $6M. Price/share = $0.50._

### 2.4 Scenario D: $10M Pre-Money Valuation, $1M Raise

| Shareholder     | Pre-Round Shares | Pre-Round % | Post-Round Shares | Post-Round % | Dilution |
| --------------- | ---------------- | ----------- | ----------------- | ------------ | -------- |
| Founder         | 7,500,000        | 75.0%       | 7,500,000         | 68.2%        | -6.8%    |
| Advisor Pool    | 500,000          | 5.0%        | 500,000           | 4.5%         | -0.5%    |
| ESOP            | 2,000,000        | 20.0%       | 2,000,000         | 18.2%        | -1.8%    |
| **Investor(s)** | **0**            | **0%**      | **1,000,000**     | **9.1%**     | **--**   |
| **Total**       | **10,000,000**   | **100%**    | **11,000,000**    | **100%**     |          |

_Calculation: $1M / $10M pre-money = 10%. New shares = 10,000,000 x (1,000K / 10,000K) = 1,000,000. Post-money = $11M. Price/share = $1.00._

### 2.5 Scenario Summary

| Scenario | Pre-Money | Raise | Post-Money | Investor % | Founder % | Price/Share |
| -------- | --------- | ----- | ---------- | ---------- | --------- | ----------- |
| A        | $2M       | $250K | $2.25M     | 11.1%      | 66.7%     | $0.20       |
| B        | $5M       | $500K | $5.5M      | 9.1%       | 68.2%     | $0.50       |
| C        | $5M       | $1M   | $6M        | 16.7%      | 62.5%     | $0.50       |
| D        | $10M      | $1M   | $11M       | 9.1%       | 68.2%     | $1.00       |

### 2.6 Option Pool Top-Up Analysis

Investors often require the option pool to be "topped up" to a target percentage (typically 10-15%) on a post-money basis before the investment. This dilutes the founder, not the investor.

**Example: Scenario B with 15% post-money ESOP requirement**

Current ESOP post-money: 18.2% (above 15% target -- no top-up needed).

**Example: Scenario C after significant grants have been made (10% ESOP remaining)**

If 1,000,000 options have been granted (leaving 1,000,000 in pool = 8.3% post-money), investor requires 15% post-money pool:

| Step                            | Shares                                                   |
| ------------------------------- | -------------------------------------------------------- |
| Target ESOP (15% of post-money) | 15% x 12,000,000 = 1,800,000                             |
| Current unallocated ESOP        | 1,000,000                                                |
| Top-up needed                   | 800,000 new shares                                       |
| New total shares                | 12,800,000                                               |
| Founder % after top-up          | 7,500,000 / 12,800,000 = 58.6% (vs 62.5% without top-up) |

**Key Insight:** Maintain a large unallocated option pool (20% as structured) to avoid punitive top-up dilution at fundraising. Grant options judiciously in early stages.

---

## 3. SAFE and Convertible Note Modeling

### 3.1 SAFE (Simple Agreement for Future Equity) -- Preferred Instrument

DealStage recommends using the YC standard post-money SAFE for pre-seed fundraising.

**Key Terms:**

| Term                      | Recommended Value           | Notes                                 |
| ------------------------- | --------------------------- | ------------------------------------- |
| Type                      | Post-money SAFE             | YC standard; cleaner conversion math  |
| Valuation Cap             | $3M - $8M                   | Based on traction at time of raise    |
| Discount                  | None (cap only)             | Simpler; standard for post-money SAFE |
| Pro-rata rights           | Yes (for investors >$100K)  | Standard side letter                  |
| MFN (Most Favored Nation) | Yes                         | Protects early SAFE investors         |
| Conversion trigger        | Priced equity round of $1M+ | Standard                              |

### 3.2 SAFE Conversion Scenarios

**Scenario: $500K SAFE at $5M Cap, converting at Series Seed ($8M pre-money, $2M raise)**

| Step                                         | Calculation                 | Result           |
| -------------------------------------------- | --------------------------- | ---------------- |
| SAFE conversion price                        | $5M cap / 10,000,000 shares | $0.50/share      |
| Series Seed price                            | $8M / 10,000,000 shares     | $0.80/share      |
| SAFE converts at lower of cap or round price | $0.50 < $0.80               | $0.50/share      |
| SAFE shares issued                           | $500K / $0.50               | 1,000,000 shares |
| Series Seed new shares                       | $2M / $0.80                 | 2,500,000 shares |

**Post-conversion cap table:**

| Shareholder           | Shares         | %        |
| --------------------- | -------------- | -------- |
| Founder               | 7,500,000      | 55.6%    |
| Advisor Pool          | 500,000        | 3.7%     |
| ESOP                  | 2,000,000      | 14.8%    |
| SAFE Investors        | 1,000,000      | 7.4%     |
| Series Seed Investors | 2,500,000      | 18.5%    |
| **Total**             | **13,500,000** | **100%** |

### 3.3 Convertible Note Modeling (Alternative)

If a convertible note is used instead of a SAFE:

| Term               | Recommended Value             | Notes                                       |
| ------------------ | ----------------------------- | ------------------------------------------- |
| Principal          | $250K - $500K                 | Smaller raises                              |
| Interest Rate      | 5-8% annual                   | Simple interest; required by securities law |
| Maturity Date      | 18-24 months                  | Convert or repay at maturity                |
| Valuation Cap      | $3M - $8M                     | Same range as SAFE                          |
| Discount Rate      | 15-20%                        | Applied to next round price                 |
| Conversion trigger | Qualified financing of $500K+ | Standard                                    |

**Example: $250K Note, 6% interest, 18-month maturity, $5M cap, 20% discount**

Conversion at Series Seed ($8M pre, 18 months later):

| Step                                        | Calculation              | Result         |
| ------------------------------------------- | ------------------------ | -------------- |
| Principal + interest                        | $250K x (1 + 0.06 x 1.5) | $272,500       |
| Cap price                                   | $5M / 10,000,000         | $0.50/share    |
| Discount price                              | $0.80 x (1 - 0.20)       | $0.64/share    |
| Conversion price (lower of cap or discount) | min($0.50, $0.64)        | $0.50/share    |
| Shares issued                               | $272,500 / $0.50         | 545,000 shares |

### 3.4 SAFE vs. Convertible Note Comparison

| Factor                         | SAFE                    | Convertible Note                    |
| ------------------------------ | ----------------------- | ----------------------------------- |
| Legal cost to issue            | $0-$500 (YC template)   | $2,000-$5,000                       |
| Interest accrual               | None                    | Yes (benefits investor)             |
| Maturity date / repayment risk | None                    | Yes (risk to company)               |
| Complexity                     | Low                     | Medium                              |
| Investor familiarity           | High (standard in tech) | High (traditional)                  |
| Conversion math                | Clean (post-money SAFE) | Complex (interest + discount + cap) |
| **Recommendation**             | **Preferred**           | Use only if investor requires       |

---

## 4. Cap Table Maintenance Guidelines

### 4.1 Record-Keeping Requirements

| Action                     | Documentation Required                                                    | Timing                 |
| -------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| Share issuance             | Board consent, stock certificate or electronic record, cap table update   | Within 5 business days |
| Option grant               | Board consent, option agreement, 409A valuation on file, cap table update | Within 5 business days |
| Option exercise            | Exercise notice, payment confirmation, share issuance, cap table update   | Within 5 business days |
| SAFE issuance              | Signed SAFE, wire confirmation, cap table update (noted as unconverted)   | Within 5 business days |
| SAFE conversion            | Conversion notice, share issuance, cap table update                       | At qualifying event    |
| Transfer/assignment        | Transfer agreement, board approval (if ROFR applies), cap table update    | Within 5 business days |
| Termination (vesting stop) | Termination notice, unvested share forfeiture, updated cap table          | Within 5 business days |

### 4.2 409A Valuation Schedule

| Trigger                                                  | Requirement                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| Before first option grant                                | Obtain 409A valuation                                        |
| Every 12 months                                          | Refresh 409A valuation                                       |
| After material event (funding, revenue milestone, pivot) | Refresh 409A within 90 days                                  |
| Estimated cost                                           | $1,000-$5,000 (use providers like Carta, Pulley, or Eqvista) |

### 4.3 Cap Table Tools (Recommended)

| Tool                 | Cost           | Best For                             |
| -------------------- | -------------- | ------------------------------------ |
| Carta                | $3,000+/year   | Funded startups, institutional-grade |
| Pulley               | Free-$200/year | Pre-seed/seed, simple cap tables     |
| Captable.io          | Free-$500/year | Early-stage, SAFE tracking           |
| Spreadsheet (manual) | Free           | Pre-funding, <5 shareholders         |

**Recommendation:** Use Pulley or manual spreadsheet until first priced round, then migrate to Carta.

---

## 5. Dilution Roadmap (Founder Perspective)

Projected founder ownership through multiple funding rounds:

| Event                            | Founder Shares | Total Shares | Founder % | Cumulative Dilution |
| -------------------------------- | -------------- | ------------ | --------- | ------------------- |
| Founding                         | 7,500,000      | 10,000,000   | 75.0%     | 0%                  |
| Pre-Seed SAFE ($500K at $5M cap) | 7,500,000      | 11,000,000   | 68.2%     | -6.8%               |
| Seed Round ($2M at $15M pre)     | 7,500,000      | 12,466,667   | 60.2%     | -14.8%              |
| ESOP Top-up (to 15% post-Seed)   | 7,500,000      | 13,200,000   | 56.8%     | -18.2%              |
| Series A ($5M at $40M pre)       | 7,500,000      | 14,850,000   | 50.5%     | -24.5%              |

**Key Insight:** With disciplined dilution management, the founder retains majority ownership (>50%) through Series A. This assumes no secondary sales or additional co-founder share grants.

---

# END OF BATCH 7

---

**Cross-Reference Index:**

- Deliverable 22 (Pricing Model) is referenced by Deliverable 23 (Budget) and Deliverable 25 (Fundraising)
- Deliverable 23 (Budget) feeds Month 12/24 projections into Deliverable 25 investor metrics
- Deliverable 24 (Signing Authority) governs all expenditures in Deliverable 23
- Deliverable 25 (Fundraising Readiness) references Deliverable 26 (Cap Table) for equity documentation
- Deliverable 26 (Cap Table) scenario modeling aligns with fundraising targets in Deliverable 25

**Next Batch:** Batch 8 (Deliverables 27-31)
