# OWNLAY AI/ML Feature Specifications

## Overview
OWNLAY includes several AI/ML-powered features designed to help marketers make better decisions. All AI features are designed with explainability in mind and include fallback rule-based logic.

---

## 1. AI Insights Card Generator

### Purpose
Automatically surface actionable insights from marketing data.

### Input Data
- Campaign performance metrics (spend, conversions, ROAS, CTR, CPA)
- Historical trends (7-day, 30-day, 90-day comparisons)
- Cross-channel attribution data
- Audience segment performance
- Creative asset performance

### Model Type
- **Primary**: Ensemble of anomaly detection + classification models
- **Techniques**: Isolation Forest for anomalies, XGBoost for opportunity classification
- **Fallback**: Rule-based thresholds (e.g., CTR decline > 20% in 7 days)

### Output Format
```json
{
  "insight_id": "insight_001",
  "type": "opportunity|warning|info|anomaly",
  "title": "Human-readable title",
  "description": "Detailed explanation with specific data points",
  "impact": "+$2,340/week estimated improvement",
  "confidence_score": 92,
  "supporting_data": {
    "current_value": 3.2,
    "benchmark_value": 4.1,
    "trend": "declining"
  },
  "action": {
    "type": "budget_reallocation|view_creative|create_audience|review_campaign",
    "label": "Apply Change",
    "params": { ... }
  },
  "created_at": "2024-12-12T10:00:00Z"
}
```

### Retraining Cadence
- Weekly model retraining on aggregated workspace data
- Daily feature refresh for real-time insights

---

## 2. Budget Optimizer

### Purpose
Recommend optimal budget allocation across channels and campaigns to maximize ROAS or minimize CPA.

### Input Data
- Historical spend and performance by channel/campaign
- Conversion attribution data
- Seasonality patterns
- Budget constraints
- Business objectives (ROAS target, CPA cap)

### Model Type
- **Primary**: Multi-armed bandit with Thompson Sampling
- **Alternative**: Bayesian optimization for continuous budget variables
- **Fallback**: Rule-based allocation based on historical ROAS rankings

### Output Format
```json
{
  "recommendation_id": "opt_001",
  "current_allocation": {
    "google_ads": 50000,
    "meta_ads": 30000,
    "tiktok_ads": 20000
  },
  "recommended_allocation": {
    "google_ads": 45000,
    "meta_ads": 40000,
    "tiktok_ads": 15000
  },
  "expected_impact": {
    "roas_change": "+0.4x",
    "revenue_change": "+$8,500/week",
    "conversion_change": "+12%"
  },
  "confidence_score": 87,
  "explanation": "Meta Ads retargeting shows 2.3x higher conversion rate for returning visitors. Recommend shifting budget from TikTok prospecting.",
  "action_button": "Apply Recommendation"
}
```

### Retraining Cadence
- Model updates every 24 hours with new performance data
- Full retraining weekly

---

## 3. Predictive ROI Model

### Purpose
Forecast expected returns for different budget scenarios.

### Input Data
- Historical spend vs. revenue relationship
- Seasonality and trend data
- Market saturation signals (diminishing returns curves)
- Competitive landscape indicators

### Model Type
- **Primary**: Gradient Boosted Regression with quantile outputs
- **Alternative**: Prophet for time-series forecasting
- **Fallback**: Linear regression with historical average multipliers

### Output Format
```json
{
  "prediction_id": "pred_001",
  "scenarios": [
    {
      "budget_change": "+10000",
      "predicted_revenue": 42000,
      "predicted_roas": 4.2,
      "confidence_interval": [38000, 46000],
      "confidence_score": 85
    },
    {
      "budget_change": "-10000",
      "predicted_revenue": -35000,
      "predicted_roas": 4.0,
      "confidence_interval": [-38000, -32000],
      "confidence_score": 88
    }
  ],
  "optimal_budget": 95000,
  "optimal_roas": 4.8,
  "breakeven_point": 23400
}
```

### Retraining Cadence
- Daily model updates
- Weekly full retraining

---

## 4. Anomaly Detection

### Purpose
Detect unusual patterns in marketing metrics that may indicate issues or opportunities.

### Input Data
- Real-time metrics stream (spend, impressions, clicks, conversions)
- Historical baselines (7-day rolling averages)
- Seasonality adjustments
- External events calendar (holidays, promotions)

### Model Type
- **Primary**: Isolation Forest + LSTM for time-series anomalies
- **Alternative**: Statistical process control (SPC) charts
- **Fallback**: Z-score thresholds (> 2.5 standard deviations)

### Output Format
```json
{
  "anomaly_id": "anom_001",
  "metric": "daily_spend",
  "detected_at": "2024-12-12T07:00:00Z",
  "severity": "high|medium|low",
  "current_value": 8500,
  "expected_value": 4200,
  "deviation_percent": 102,
  "confidence_score": 91,
  "possible_causes": [
    "Bidding strategy change",
    "Increased competition",
    "Budget cap hit"
  ],
  "recommended_action": "Review campaign bidding settings",
  "action_button": "Investigate"
}
```

### Retraining Cadence
- Real-time scoring
- Daily baseline recalculation
- Weekly model retraining

---

## 5. Creative Fatigue Detector

### Purpose
Identify when ad creatives are losing effectiveness due to audience fatigue.

### Input Data
- Creative-level performance metrics over time
- Frequency and reach data
- Audience overlap between ad sets
- Engagement decay curves

### Model Type
- **Primary**: Time-series classification (declining CTR/CVR patterns)
- **Alternative**: Survival analysis for creative lifespan
- **Fallback**: Rule-based (CTR decline > 20% over 7 days with frequency > 3)

### Output Format
```json
{
  "fatigue_alert_id": "fat_001",
  "creative_id": "creative_123",
  "creative_name": "Summer Sale - Banner 3",
  "fatigue_score": 78,
  "days_since_peak": 12,
  "metrics_trend": {
    "ctr_change_7d": -34,
    "cvr_change_7d": -28,
    "frequency": 4.2
  },
  "confidence_score": 87,
  "recommendation": "Refresh creative with new imagery or copy variant",
  "action_button": "View Creative"
}
```

### Retraining Cadence
- Daily creative analysis
- Weekly model updates

---

## 6. NLP Natural Language Query

### Purpose
Allow users to ask questions about their data in plain English.

### Input Data
- User query text
- Available metrics schema
- Historical query patterns
- Current dashboard context

### Model Type
- **Primary**: Fine-tuned LLM (GPT-4 or similar) with RAG
- **Alternative**: Intent classification + template matching
- **Fallback**: Keyword matching to predefined report templates

### Output Format
```json
{
  "query_id": "nlq_001",
  "original_query": "Why did my CPA increase last week?",
  "interpreted_query": "Analyze CPA changes comparing last 7 days to previous 7 days",
  "response": {
    "summary": "Your CPA increased by 15% primarily due to...",
    "data_points": [
      { "metric": "cpc_change", "value": "+12%" },
      { "metric": "conversion_rate_change", "value": "-14%" }
    ],
    "visualizations": ["cpa_trend_chart", "channel_breakdown"],
    "suggested_actions": [
      "Review landing page changes",
      "Adjust bid strategy"
    ]
  },
  "confidence_score": 85,
  "follow_up_questions": [
    "Which campaigns were most affected?",
    "What changed on the landing page?"
  ]
}
```

### Retraining Cadence
- Base model: Quarterly fine-tuning
- RAG index: Daily updates

---

## 7. Automated Copy Generator

### Purpose
Generate ad copy, headlines, and CTAs based on product descriptions and brand guidelines.

### Input Data
- Product/service description
- Brand voice guidelines
- Historical top-performing copy
- Target audience characteristics
- Character/word limits

### Model Type
- **Primary**: Fine-tuned LLM with brand voice embedding
- **Alternative**: Template-based generation with variable substitution
- **Fallback**: Best-performing historical copy suggestions

### Output Format
```json
{
  "generation_id": "gen_001",
  "input_context": "Premium wireless headphones with ANC",
  "tone": "professional",
  "output_type": "headline",
  "variations": [
    {
      "text": "Silence the World. Hear Every Detail.",
      "confidence_score": 92,
      "predicted_ctr": 2.4
    },
    {
      "text": "Your Focus. Our Technology. Pure Sound.",
      "confidence_score": 88,
      "predicted_ctr": 2.1
    },
    {
      "text": "Premium Noise Cancellation Starts at $199",
      "confidence_score": 85,
      "predicted_ctr": 2.8
    }
  ],
  "brand_compliance_score": 94,
  "action_button": "Use This Copy"
}
```

### Retraining Cadence
- Weekly fine-tuning on high-performing copy
- Real-time brand guideline enforcement

---

## Explainability & Fallback Logic

All AI features include:

1. **Confidence Scores**: 0-100 score indicating model certainty
2. **Explanation Text**: Human-readable reasoning
3. **Supporting Data**: Raw data points backing the recommendation
4. **Fallback Rules**: Rule-based logic when model confidence < 70%

### Fallback Rule Examples

| Feature | Fallback Rule |
|---------|--------------|
| Budget Optimizer | Allocate proportionally to historical ROAS |
| Creative Fatigue | Alert if CTR drops 20%+ in 7 days |
| Anomaly Detection | Alert if metric > 2.5 std dev from mean |
| ROI Prediction | Use 90-day average ROAS multiplier |

---

## Model Governance

- All models logged in MLflow for versioning
- A/B testing required before production deployment
- Human review for high-impact recommendations (> $1000)
- Weekly model performance reviews
- Quarterly bias audits
