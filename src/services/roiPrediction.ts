// ROI Prediction Engine for OWNLAY Marketing OS
// Implements linear regression forecasting and budget optimization
// Version: 4.1.0 - Enterprise Predictive Analytics

import { TenantContext } from '../db/multiTenant';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface HistoricalDataPoint {
  date: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  platform: string;
}

export interface PredictionInput {
  budgetChange: number;  // Amount to increase/decrease
  targetMetric: 'revenue' | 'roas' | 'cpa' | 'conversions';
  platform?: string;
  campaignId?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface PredictionResult {
  id: string;
  prediction_type: string;
  target_metric: string;
  current_value: number;
  proposed_change: number;
  change_percentage: number;
  predicted_outcome: number;
  prediction_low: number;
  prediction_high: number;
  confidence_score: number;
  roi_multiplier: number;
  payback_period_days: number;
  recommendation: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_factors: string[];
  model_coefficients: {
    slope: number;
    intercept: number;
    r_squared: number;
    data_points: number;
  };
  predicted_impact: {
    revenue_change: number;
    roas_change: number;
    cpa_change: number;
    conversion_change: number;
  };
}

export interface LinearRegressionModel {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  dataPoints: number;
}

// ============================================
// LINEAR REGRESSION IMPLEMENTATION
// ============================================

class LinearRegression {
  private slope: number = 0;
  private intercept: number = 0;
  private rSquared: number = 0;
  private standardError: number = 0;
  private n: number = 0;

  /**
   * Fit a linear regression model to the data
   * @param x - Independent variable (e.g., spend)
   * @param y - Dependent variable (e.g., revenue)
   */
  fit(x: number[], y: number[]): LinearRegressionModel {
    if (x.length !== y.length || x.length < 2) {
      throw new Error('Invalid data for regression');
    }

    this.n = x.length;

    // Calculate means
    const xMean = x.reduce((a, b) => a + b, 0) / this.n;
    const yMean = y.reduce((a, b) => a + b, 0) / this.n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < this.n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }

    this.slope = denominator !== 0 ? numerator / denominator : 0;
    this.intercept = yMean - this.slope * xMean;

    // Calculate R-squared
    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < this.n; i++) {
      const predicted = this.predict(x[i]);
      ssRes += (y[i] - predicted) ** 2;
      ssTot += (y[i] - yMean) ** 2;
    }

    this.rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    // Calculate standard error
    this.standardError = Math.sqrt(ssRes / (this.n - 2));

    return {
      slope: this.slope,
      intercept: this.intercept,
      rSquared: this.rSquared,
      standardError: this.standardError,
      dataPoints: this.n
    };
  }

  /**
   * Predict y value for given x
   */
  predict(x: number): number {
    return this.slope * x + this.intercept;
  }

  /**
   * Get prediction interval (confidence bounds)
   */
  getPredictionInterval(x: number, confidence: number = 0.95): { low: number; high: number } {
    const predicted = this.predict(x);
    
    // t-value for 95% confidence (approximate for large samples)
    const tValue = 1.96;
    
    // Margin of error
    const margin = tValue * this.standardError * Math.sqrt(1 + 1/this.n);
    
    return {
      low: predicted - margin,
      high: predicted + margin
    };
  }

  getModel(): LinearRegressionModel {
    return {
      slope: this.slope,
      intercept: this.intercept,
      rSquared: this.rSquared,
      standardError: this.standardError,
      dataPoints: this.n
    };
  }
}

// ============================================
// ROI PREDICTION ENGINE
// ============================================

export class ROIPredictionEngine {
  private database: D1Database;
  private context: TenantContext;

  constructor(database: D1Database, context: TenantContext) {
    this.database = database;
    this.context = context;
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  async getHistoricalData(options: {
    platform?: string;
    campaignId?: string;
    days?: number;
  } = {}): Promise<HistoricalDataPoint[]> {
    const days = options.days || 90;
    
    let query = `
      SELECT 
        date(timestamp) as date,
        platform,
        SUM(spend) as spend,
        SUM(revenue) as revenue,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(conversions) as conversions
      FROM metrics_timeseries
      WHERE org_id = ? AND brand_id = ?
        AND timestamp >= datetime('now', '-${days} days')
        AND granularity = 'day'
    `;
    const params: any[] = [this.context.orgId, this.context.brandId];

    if (options.platform) {
      query += ' AND platform = ?';
      params.push(options.platform);
    }

    if (options.campaignId) {
      query += ' AND campaign_id = ?';
      params.push(options.campaignId);
    }

    query += ' GROUP BY date, platform ORDER BY date ASC';

    const result = await this.database.prepare(query).bind(...params).all<any>();
    
    // If no data, generate synthetic data for demo
    if (!result.results || result.results.length === 0) {
      return this.generateSyntheticData(days);
    }

    return result.results.map(r => ({
      date: r.date,
      spend: r.spend || 0,
      revenue: r.revenue || 0,
      impressions: r.impressions || 0,
      clicks: r.clicks || 0,
      conversions: r.conversions || 0,
      platform: r.platform
    }));
  }

  private generateSyntheticData(days: number): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic marketing metrics with trend
      const trendFactor = 1 + (i / days) * 0.1; // 10% growth over period
      const seasonalFactor = 1 + 0.2 * Math.sin((i / 7) * Math.PI * 2); // Weekly pattern
      const randomFactor = 0.9 + Math.random() * 0.2; // ±10% noise

      const baseSpend = 500 * trendFactor * seasonalFactor * randomFactor;
      const baseConversions = Math.floor(15 * trendFactor * seasonalFactor * randomFactor);
      const roas = 2.5 + Math.random() * 1.5; // ROAS between 2.5 and 4.0

      data.push({
        date: date.toISOString().split('T')[0],
        spend: Math.round(baseSpend * 100) / 100,
        revenue: Math.round(baseSpend * roas * 100) / 100,
        impressions: Math.floor(baseSpend * 100 * randomFactor),
        clicks: Math.floor(baseSpend * 2 * randomFactor),
        conversions: baseConversions,
        platform: ['google', 'meta', 'tiktok'][i % 3]
      });
    }

    return data;
  }

  // ============================================
  // PREDICTION METHODS
  // ============================================

  async predictBudgetImpact(input: PredictionInput): Promise<PredictionResult> {
    const historicalData = await this.getHistoricalData({
      platform: input.platform,
      campaignId: input.campaignId,
      days: 90
    });

    if (historicalData.length < 7) {
      throw new Error('Insufficient historical data for prediction');
    }

    // Extract spend and revenue for regression
    const spendData = historicalData.map(d => d.spend);
    const revenueData = historicalData.map(d => d.revenue);
    const conversionsData = historicalData.map(d => d.conversions);

    // Fit regression models
    const revenueModel = new LinearRegression();
    revenueModel.fit(spendData, revenueData);

    const conversionsModel = new LinearRegression();
    conversionsModel.fit(spendData, conversionsData);

    // Current metrics
    const currentSpend = spendData.reduce((a, b) => a + b, 0) / spendData.length;
    const currentRevenue = revenueData.reduce((a, b) => a + b, 0) / revenueData.length;
    const currentConversions = conversionsData.reduce((a, b) => a + b, 0) / conversionsData.length;
    const currentROAS = currentRevenue / currentSpend;
    const currentCPA = currentSpend / Math.max(currentConversions, 1);

    // Proposed spend
    const proposedSpend = currentSpend + input.budgetChange;
    const changePercentage = (input.budgetChange / currentSpend) * 100;

    // Predictions
    const predictedRevenue = revenueModel.predict(proposedSpend);
    const predictedConversions = conversionsModel.predict(proposedSpend);
    const predictedROAS = predictedRevenue / proposedSpend;
    const predictedCPA = proposedSpend / Math.max(predictedConversions, 1);

    // Confidence intervals
    const revenueInterval = revenueModel.getPredictionInterval(proposedSpend);
    const modelCoeffs = revenueModel.getModel();

    // Calculate predicted value based on target metric
    let predictedOutcome: number;
    let currentValue: number;
    
    switch (input.targetMetric) {
      case 'revenue':
        predictedOutcome = predictedRevenue;
        currentValue = currentRevenue;
        break;
      case 'roas':
        predictedOutcome = predictedROAS;
        currentValue = currentROAS;
        break;
      case 'cpa':
        predictedOutcome = predictedCPA;
        currentValue = currentCPA;
        break;
      case 'conversions':
        predictedOutcome = predictedConversions;
        currentValue = currentConversions;
        break;
      default:
        predictedOutcome = predictedRevenue;
        currentValue = currentRevenue;
    }

    // ROI calculation
    const additionalRevenue = predictedRevenue - currentRevenue;
    const roiMultiplier = input.budgetChange > 0 
      ? additionalRevenue / input.budgetChange 
      : 0;

    // Payback period (days to recover additional spend)
    const dailyAdditionalRevenue = additionalRevenue / 30;
    const paybackPeriod = dailyAdditionalRevenue > 0 
      ? Math.ceil(input.budgetChange / dailyAdditionalRevenue)
      : 0;

    // Risk assessment
    const riskFactors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (modelCoeffs.rSquared < 0.5) {
      riskFactors.push('Low model confidence (R² < 0.5)');
      riskLevel = 'high';
    } else if (modelCoeffs.rSquared < 0.7) {
      riskFactors.push('Moderate model confidence (R² < 0.7)');
      riskLevel = 'medium';
    }

    if (changePercentage > 50) {
      riskFactors.push('Large budget change (>50%)');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    if (roiMultiplier < 1) {
      riskFactors.push('Predicted ROI below 1x');
      riskLevel = 'high';
    }

    if (historicalData.length < 30) {
      riskFactors.push('Limited historical data (<30 days)');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Generate recommendation
    const recommendation = this.generateRecommendation({
      roiMultiplier,
      riskLevel,
      changePercentage,
      predictedROAS,
      currentROAS,
      targetMetric: input.targetMetric
    });

    // Confidence score (based on R² and data points)
    const confidenceScore = Math.min(100, 
      modelCoeffs.rSquared * 60 + 
      Math.min(modelCoeffs.dataPoints / 90, 1) * 40
    );

    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store prediction in database
    await this.storePrediction({
      id: predictionId,
      prediction_type: 'budget_increase',
      target_metric: input.targetMetric,
      platform: input.platform || 'all',
      current_value: currentValue,
      proposed_change: input.budgetChange,
      change_percentage: changePercentage,
      predicted_outcome: predictedOutcome,
      prediction_low: revenueInterval.low,
      prediction_high: revenueInterval.high,
      confidence_score: confidenceScore,
      roi_multiplier: roiMultiplier,
      payback_period_days: paybackPeriod,
      recommendation,
      risk_level: riskLevel,
      risk_factors: JSON.stringify(riskFactors),
      model_coefficients: JSON.stringify(modelCoeffs),
      predicted_impact: JSON.stringify({
        revenue_change: predictedRevenue - currentRevenue,
        roas_change: predictedROAS - currentROAS,
        cpa_change: predictedCPA - currentCPA,
        conversion_change: predictedConversions - currentConversions
      })
    });

    return {
      id: predictionId,
      prediction_type: 'budget_increase',
      target_metric: input.targetMetric,
      current_value: Math.round(currentValue * 100) / 100,
      proposed_change: input.budgetChange,
      change_percentage: Math.round(changePercentage * 10) / 10,
      predicted_outcome: Math.round(predictedOutcome * 100) / 100,
      prediction_low: Math.round(revenueInterval.low * 100) / 100,
      prediction_high: Math.round(revenueInterval.high * 100) / 100,
      confidence_score: Math.round(confidenceScore * 10) / 10,
      roi_multiplier: Math.round(roiMultiplier * 100) / 100,
      payback_period_days: paybackPeriod,
      recommendation,
      risk_level: riskLevel,
      risk_factors: riskFactors,
      model_coefficients: modelCoeffs,
      predicted_impact: {
        revenue_change: Math.round((predictedRevenue - currentRevenue) * 100) / 100,
        roas_change: Math.round((predictedROAS - currentROAS) * 100) / 100,
        cpa_change: Math.round((predictedCPA - currentCPA) * 100) / 100,
        conversion_change: Math.round(predictedConversions - currentConversions)
      }
    };
  }

  private generateRecommendation(params: {
    roiMultiplier: number;
    riskLevel: string;
    changePercentage: number;
    predictedROAS: number;
    currentROAS: number;
    targetMetric: string;
  }): string {
    const { roiMultiplier, riskLevel, changePercentage, predictedROAS, currentROAS, targetMetric } = params;

    if (roiMultiplier >= 3 && riskLevel === 'low') {
      return `STRONGLY RECOMMENDED: This budget increase shows excellent ROI potential (${roiMultiplier.toFixed(1)}x). Historical data supports aggressive scaling.`;
    }

    if (roiMultiplier >= 2 && riskLevel !== 'high') {
      return `RECOMMENDED: Good ROI potential with ${roiMultiplier.toFixed(1)}x return. Consider gradual implementation to validate.`;
    }

    if (roiMultiplier >= 1.5 && riskLevel !== 'high') {
      return `CAUTIOUSLY RECOMMENDED: Moderate ROI potential (${roiMultiplier.toFixed(1)}x). Start with 50% of proposed increase to test.`;
    }

    if (predictedROAS > currentROAS) {
      return `NEUTRAL: ROAS expected to improve slightly. Consider testing with smaller budget increment first.`;
    }

    if (roiMultiplier < 1) {
      return `NOT RECOMMENDED: Predicted ROI is below break-even. Review campaign performance before increasing budget.`;
    }

    return `REVIEW NEEDED: Mixed signals in the data. Recommend A/B testing with smaller budget before scaling.`;
  }

  private async storePrediction(prediction: any): Promise<void> {
    try {
      await this.database.prepare(`
        INSERT INTO roi_predictions (
          id, org_id, brand_id, prediction_type, target_metric, platform,
          current_value, proposed_change, change_percentage, predicted_outcome,
          prediction_low, prediction_high, confidence_score, roi_multiplier,
          payback_period_days, recommendation, risk_level, risk_factors,
          model_coefficients, predicted_impact, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `).bind(
        prediction.id,
        this.context.orgId,
        this.context.brandId,
        prediction.prediction_type,
        prediction.target_metric,
        prediction.platform,
        prediction.current_value,
        prediction.proposed_change,
        prediction.change_percentage,
        prediction.predicted_outcome,
        prediction.prediction_low,
        prediction.prediction_high,
        prediction.confidence_score,
        prediction.roi_multiplier,
        prediction.payback_period_days,
        prediction.recommendation,
        prediction.risk_level,
        prediction.risk_factors,
        prediction.model_coefficients,
        prediction.predicted_impact
      ).run();
    } catch (error) {
      console.error('Failed to store prediction:', error);
      // Continue without storing - don't block the prediction
    }
  }

  // ============================================
  // SCENARIO ANALYSIS
  // ============================================

  async generateBudgetScenarios(options: {
    currentBudget: number;
    platform?: string;
    campaignId?: string;
  }): Promise<{
    scenarios: Array<{
      change: number;
      percentage: string;
      predictedRevenue: number;
      predictedROAS: number;
      roi: number;
      risk: string;
    }>;
    optimal: {
      change: number;
      reason: string;
    };
  }> {
    const changes = [-0.5, -0.25, 0, 0.25, 0.5, 1.0, 2.0]; // -50% to +200%
    const scenarios = [];

    for (const multiplier of changes) {
      const budgetChange = options.currentBudget * multiplier;
      
      try {
        const prediction = await this.predictBudgetImpact({
          budgetChange,
          targetMetric: 'revenue',
          platform: options.platform,
          campaignId: options.campaignId
        });

        scenarios.push({
          change: budgetChange,
          percentage: `${multiplier >= 0 ? '+' : ''}${(multiplier * 100).toFixed(0)}%`,
          predictedRevenue: prediction.predicted_outcome,
          predictedROAS: prediction.predicted_impact.roas_change + prediction.current_value,
          roi: prediction.roi_multiplier,
          risk: prediction.risk_level
        });
      } catch (error) {
        // Skip failed predictions
      }
    }

    // Find optimal scenario (best ROI with acceptable risk)
    const optimalScenario = scenarios
      .filter(s => s.risk !== 'high' && s.change > 0)
      .sort((a, b) => b.roi - a.roi)[0];

    return {
      scenarios,
      optimal: optimalScenario ? {
        change: optimalScenario.change,
        reason: `Best ROI (${optimalScenario.roi.toFixed(1)}x) with ${optimalScenario.risk} risk`
      } : {
        change: 0,
        reason: 'Current budget is optimal based on historical performance'
      }
    };
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  async getPredictions(options: {
    status?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    let query = `
      SELECT * FROM roi_predictions
      WHERE org_id = ? AND brand_id = ?
    `;
    const params: any[] = [this.context.orgId, this.context.brandId];

    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(options.limit || 50);

    const result = await this.database.prepare(query).bind(...params).all<any>();
    
    return (result.results || []).map(p => ({
      ...p,
      risk_factors: JSON.parse(p.risk_factors || '[]'),
      model_coefficients: JSON.parse(p.model_coefficients || '{}'),
      predicted_impact: JSON.parse(p.predicted_impact || '{}')
    }));
  }

  async approvePrediction(predictionId: string, userId: string): Promise<void> {
    await this.database.prepare(`
      UPDATE roi_predictions 
      SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(userId, predictionId, this.context.orgId, this.context.brandId).run();
  }
}

// Factory function
export function createROIPredictionEngine(
  database: D1Database,
  context: TenantContext
): ROIPredictionEngine {
  return new ROIPredictionEngine(database, context);
}
