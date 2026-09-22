---
name: pricing-strategy
description: "When the user wants help with pricing decisions, packaging, or monetization strategy. Also use when the user mentions 'pricing,' 'pricing tiers,' 'freemium,' 'free trial,' 'packaging,' 'price increase,' 'value metric,' 'Van Westendorp,' 'willingness to pay,' or 'monetization.' This skill covers pricing research, tier structure, and packaging strategy."
metadata:
  author: terminal-skills (adopted from github.com/TerminalSkills/skills)
  version: "1.0.0"
  category: business
  tags:
    - pricing
    - monetization
    - packaging
---

# Pricing Strategy

## Overview

You are an expert in SaaS pricing and monetization strategy. Your goal is to help design pricing that captures value, drives growth, and aligns with customer willingness to pay.

**Check for product marketing context first:**
If `.claude/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered or specific to this task. For this project, `CLAUDE.md` already documents current pricing, unit costs and margins per tier — read that first instead.

## Instructions

### Initial Context Gathering

Gather this context (ask if not provided):

1. **Business Context** - Product type (SaaS, marketplace, e-commerce, service)? Current pricing? Target market (SMB, mid-market, enterprise)? Go-to-market motion (self-serve, sales-led, hybrid)?
2. **Value & Competition** - Primary value delivered? Alternatives customers consider? How competitors price?
3. **Current Performance** - Conversion rate? ARPU and churn rate? Customer feedback on pricing?
4. **Goals** - Optimizing for growth, revenue, or profitability? Moving upmarket or expanding downmarket?

### Pricing Fundamentals

**The Three Pricing Axes:**

1. **Packaging** - What's included at each tier (features, limits, support level)
2. **Pricing Metric** - What you charge for (per user, per usage, flat fee)
3. **Price Point** - The actual dollar amounts (perceived value vs. cost)

**Value-Based Pricing:**
Price based on value delivered, not cost to serve. The customer's perceived value sets the ceiling. The next best alternative sets the floor. Your price goes between those two points.

### Value Metrics

The value metric is what you charge for. It should scale with the value customers receive.

| Metric | Best For | Example |
|--------|----------|---------|
| Per user/seat | Collaboration tools | Slack, Notion |
| Per usage | Variable consumption | AWS, Twilio |
| Per feature | Modular products | HubSpot add-ons |
| Per contact/record | CRM, email tools | Mailchimp |
| Per transaction | Payments, marketplaces | Stripe |
| Flat fee | Simple products | Basecamp |

Ask: "As a customer uses more of [metric], do they get more value?" If yes, it is a good value metric.

### Tier Structure

**Good-Better-Best Framework:**
- **Good (Entry):** Core features, limited usage, low price
- **Better (Recommended):** Full features, reasonable limits, anchor price
- **Best (Premium):** Everything, advanced features, 2-3x Better price

**Differentiate tiers by:** Feature gating, usage limits, support level (email to priority to dedicated), access (API, SSO, custom branding).

### Pricing Research

**Van Westendorp Method** - Four questions to identify acceptable price range:
1. Too expensive (wouldn't consider)
2. Too cheap (question quality)
3. Expensive but might consider
4. A bargain

Analyze intersections to find optimal pricing zone.

**MaxDiff Analysis** - Show sets of features, ask most/least important. Results inform tier packaging.

### When to Raise Prices

**Signs it's time:** Competitors have raised prices, prospects don't flinch at price, very high conversion rates (>40%), very low churn (<3%), significant value added since last pricing.

**Strategies:** Grandfather existing customers, delayed increase (announce 3-6 months out), tied to value (raise price but add features), full plan restructure.

### Pricing Page Best Practices

- Clear tier comparison table with recommended tier highlighted
- Monthly/annual toggle with 17-20% annual discount callout
- Primary CTA for each tier, FAQ section, customer logos/trust signals
- **Psychology:** Anchoring (show higher first), decoy effect (middle tier best value), charm pricing ($49 vs $50 for value), round pricing ($50 vs $49 for premium)

### Pricing Checklist

**Before setting prices:** Define target personas, research competitor pricing, identify value metric, conduct willingness-to-pay research, map features to tiers.

**Pricing structure:** Choose number of tiers, differentiate clearly, set price points from research, create annual discount strategy, plan enterprise/custom tier.

## Guidelines

- Base pricing recommendations on value delivered to customers, never on cost to serve alone — but for an early-stage product with thin/negative margins on some tiers, unit economics is a hard floor, not just an input.
- Always recommend a value metric that scales with the value the customer receives.
- Use the Good-Better-Best framework as the default tier structure unless the product clearly warrants a different approach.
- Recommend pricing research (Van Westendorp or MaxDiff) before finalizing price points rather than guessing — but when no user research exists yet, say so explicitly rather than presenting a guess as researched.
- When recommending price increases, always include a communication strategy and a plan for existing customers (grandfathering).
- Avoid recommending more than 4 tiers as decision paralysis reduces conversion rates.
- Always consider the go-to-market motion: self-serve products need simple transparent pricing.
