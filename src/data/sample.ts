// OWNLAY Sample Data for Demo
// Mock user personas and sample data

export const sampleData = {
    // ============================================
    // MOCK USER PERSONAS
    // ============================================
    personas: [
        {
            id: "persona_1",
            name: "Jane Doe",
            email: "jane@acme.com",
            role: "Marketing Director",
            company: "Acme Corporation",
            industry: "E-commerce",
            monthly_ad_spend: "$50,000 - $100,000",
            primary_goals: ["Increase ROAS", "Scale campaigns"],
            connected_channels: ["google_ads", "meta_ads", "ga4", "shopify"]
        },
        {
            id: "persona_2",
            name: "Mike Chen",
            email: "mike@techflow.io",
            role: "Growth Manager",
            company: "TechFlow",
            industry: "SaaS",
            monthly_ad_spend: "$10,000 - $50,000",
            primary_goals: ["Reduce CPA", "Generate leads"],
            connected_channels: ["google_ads", "linkedin_ads", "ga4"]
        },
        {
            id: "persona_3",
            name: "Sarah Wilson",
            email: "sarah@bloom.co",
            role: "Performance Marketer",
            company: "Bloom",
            industry: "D2C Beauty",
            monthly_ad_spend: "$100,000+",
            primary_goals: ["Unify data", "AI insights"],
            connected_channels: ["google_ads", "meta_ads", "tiktok_ads", "shopify", "klaviyo"]
        }
    ],

    // ============================================
    // SAMPLE CAMPAIGNS
    // ============================================
    campaigns: [
        {
            id: "camp_001",
            name: "Q4 Holiday Push",
            status: "active",
            objective: "conversions",
            channels: ["google_ads", "meta_ads", "tiktok_ads"],
            budget: { daily: 1500, total: 45000 },
            start_date: "2024-11-01",
            end_date: "2024-12-31",
            metrics: {
                spend: 45230,
                impressions: 2100000,
                clicks: 78400,
                conversions: 1247,
                revenue: 217296,
                roas: 4.8,
                ctr: 3.73,
                cpa: 36.27
            }
        },
        {
            id: "camp_002",
            name: "Brand Awareness 2024",
            status: "active",
            objective: "awareness",
            channels: ["linkedin_ads", "google_ads"],
            budget: { daily: 1000, total: 30000 },
            start_date: "2024-10-15",
            metrics: {
                spend: 28100,
                impressions: 1540000,
                clicks: 58020,
                conversions: 892,
                revenue: 89920,
                roas: 3.2,
                ctr: 3.77,
                cpa: 31.50
            }
        },
        {
            id: "camp_003",
            name: "Product Launch - Widget Pro",
            status: "paused",
            objective: "conversions",
            channels: ["meta_ads", "google_ads"],
            budget: { daily: 500, total: 15000 },
            start_date: "2024-11-15",
            metrics: {
                spend: 12450,
                impressions: 560000,
                clicks: 21200,
                conversions: 445,
                revenue: 36105,
                roas: 2.9,
                ctr: 3.79,
                cpa: 27.98
            }
        },
        {
            id: "camp_004",
            name: "Retargeting - Cart Abandoners",
            status: "active",
            objective: "conversions",
            channels: ["meta_ads"],
            budget: { daily: 300, total: 9000 },
            start_date: "2024-11-01",
            metrics: {
                spend: 8920,
                impressions: 320000,
                clicks: 14400,
                conversions: 234,
                revenue: 54434,
                roas: 6.1,
                ctr: 4.5,
                cpa: 38.12
            }
        }
    ],

    // ============================================
    // SAMPLE ADS
    // ============================================
    ads: [
        {
            id: "ad_001",
            name: "Holiday Sale - Banner A",
            campaign_id: "camp_001",
            channel: "google_ads",
            status: "active",
            type: "display",
            metrics: { spend: 12340, impressions: 456000, clicks: 8920, ctr: 1.96, conversions: 234, roas: 4.8 }
        },
        {
            id: "ad_002",
            name: "Retargeting - Video 1",
            campaign_id: "camp_004",
            channel: "meta_ads",
            status: "active",
            type: "video",
            metrics: { spend: 8450, impressions: 234000, clicks: 5670, ctr: 2.42, conversions: 178, roas: 5.2 }
        },
        {
            id: "ad_003",
            name: "Brand Awareness - Carousel",
            campaign_id: "camp_002",
            channel: "tiktok_ads",
            status: "learning",
            type: "carousel",
            metrics: { spend: 5230, impressions: 890000, clicks: 12340, ctr: 1.39, conversions: 89, roas: 2.1 }
        }
    ],

    // ============================================
    // SAMPLE AI INSIGHTS
    // ============================================
    insights: [
        {
            id: "insight_001",
            type: "opportunity",
            title: "Budget Reallocation Opportunity",
            description: "Moving $5,000/week from Google Search to Meta Retargeting could increase ROAS by 18% based on current conversion patterns.",
            impact: "+$2,340/week",
            confidence: 92,
            model: "budget_optimizer",
            action: {
                type: "budget_reallocation",
                label: "Apply Change",
                params: { from: "google_ads", to: "meta_ads", amount: 5000 }
            },
            created_at: "2024-12-12T10:00:00Z"
        },
        {
            id: "insight_002",
            type: "warning",
            title: "Creative Fatigue Detected",
            description: "Ad set 'Summer Sale - Banner 3' has shown 34% decline in CTR over the past 7 days. Consider refreshing creative assets.",
            impact: "Prevent $890 waste",
            confidence: 87,
            model: "creative_fatigue_detector",
            action: {
                type: "view_creative",
                label: "View Creative",
                params: { ad_id: "ad_summer_3" }
            },
            created_at: "2024-12-12T09:30:00Z"
        },
        {
            id: "insight_003",
            type: "opportunity",
            title: "Audience Expansion Opportunity",
            description: "Lookalike audience based on high-LTV customers shows 2.3x higher conversion probability.",
            impact: "+340 conversions/mo",
            confidence: 84,
            model: "audience_predictor",
            action: {
                type: "create_audience",
                label: "Create Audience",
                params: { base_segment: "high_ltv_customers", similarity: 0.02 }
            },
            created_at: "2024-12-12T08:00:00Z"
        },
        {
            id: "insight_004",
            type: "anomaly",
            title: "Spend Anomaly Detected",
            description: "Google Ads spend increased 45% yesterday vs. 7-day average without corresponding increase in conversions.",
            impact: "-$1,200 potential waste",
            confidence: 91,
            model: "anomaly_detector",
            action: {
                type: "review_campaign",
                label: "Review Campaign",
                params: { campaign_id: "camp_001" }
            },
            created_at: "2024-12-12T07:00:00Z"
        }
    ],

    // ============================================
    // SAMPLE METRICS (TIMESERIES)
    // Static data to avoid module-level Date/Math.random calls
    // ============================================
    metrics_timeseries: {
        period: { start: "2024-11-12", end: "2024-12-12" },
        granularity: "daily",
        data: [
            { date: "2024-11-12", spend: 4250, revenue: 17500, conversions: 125, impressions: 85000, clicks: 3100 },
            { date: "2024-11-13", spend: 3890, revenue: 16200, conversions: 118, impressions: 78000, clicks: 2850 },
            { date: "2024-11-14", spend: 4100, revenue: 18300, conversions: 132, impressions: 92000, clicks: 3250 },
            { date: "2024-11-15", spend: 4450, revenue: 19100, conversions: 138, impressions: 88000, clicks: 3400 },
            { date: "2024-11-16", spend: 3650, revenue: 15800, conversions: 112, impressions: 76000, clicks: 2750 },
            { date: "2024-11-17", spend: 3780, revenue: 16500, conversions: 120, impressions: 82000, clicks: 2900 },
            { date: "2024-11-18", spend: 4200, revenue: 18800, conversions: 135, impressions: 89000, clicks: 3300 },
            { date: "2024-11-19", spend: 4380, revenue: 19500, conversions: 142, impressions: 95000, clicks: 3450 },
            { date: "2024-11-20", spend: 4050, revenue: 17200, conversions: 128, impressions: 84000, clicks: 3050 },
            { date: "2024-11-21", spend: 3920, revenue: 16800, conversions: 122, impressions: 80000, clicks: 2980 },
            { date: "2024-11-22", spend: 4550, revenue: 20100, conversions: 145, impressions: 98000, clicks: 3550 },
            { date: "2024-11-23", spend: 4680, revenue: 21200, conversions: 148, impressions: 99000, clicks: 3620 },
            { date: "2024-11-24", spend: 4320, revenue: 19800, conversions: 140, impressions: 93000, clicks: 3380 },
            { date: "2024-11-25", spend: 4150, revenue: 18500, conversions: 133, impressions: 87000, clicks: 3200 },
            { date: "2024-11-26", spend: 3850, revenue: 16900, conversions: 124, impressions: 81000, clicks: 2920 },
            { date: "2024-11-27", spend: 4020, revenue: 17800, conversions: 130, impressions: 86000, clicks: 3100 },
            { date: "2024-11-28", spend: 4480, revenue: 19900, conversions: 143, impressions: 94000, clicks: 3480 },
            { date: "2024-11-29", spend: 4750, revenue: 21500, conversions: 150, impressions: 100000, clicks: 3700 },
            { date: "2024-11-30", spend: 4350, revenue: 19200, conversions: 138, impressions: 91000, clicks: 3350 },
            { date: "2024-12-01", spend: 4100, revenue: 18000, conversions: 131, impressions: 85000, clicks: 3150 },
            { date: "2024-12-02", spend: 3950, revenue: 17100, conversions: 126, impressions: 83000, clicks: 3020 },
            { date: "2024-12-03", spend: 4250, revenue: 18700, conversions: 136, impressions: 90000, clicks: 3280 },
            { date: "2024-12-04", spend: 4500, revenue: 20000, conversions: 144, impressions: 96000, clicks: 3500 },
            { date: "2024-12-05", spend: 4620, revenue: 20800, conversions: 147, impressions: 97000, clicks: 3580 },
            { date: "2024-12-06", spend: 4280, revenue: 19400, conversions: 139, impressions: 92000, clicks: 3320 },
            { date: "2024-12-07", spend: 4050, revenue: 18100, conversions: 132, impressions: 86000, clicks: 3120 },
            { date: "2024-12-08", spend: 3880, revenue: 17000, conversions: 123, impressions: 79000, clicks: 2950 },
            { date: "2024-12-09", spend: 4180, revenue: 18400, conversions: 134, impressions: 88000, clicks: 3220 },
            { date: "2024-12-10", spend: 4420, revenue: 19600, conversions: 141, impressions: 93000, clicks: 3420 },
            { date: "2024-12-11", spend: 4580, revenue: 20400, conversions: 146, impressions: 95000, clicks: 3540 }
        ]
    },

    // ============================================
    // CHANNEL BREAKDOWN
    // ============================================
    channels: [
        {
            id: "google_ads",
            name: "Google Ads",
            icon: "fab fa-google",
            connected: true,
            last_sync: "2024-12-12T14:25:00Z",
            metrics: {
                spend: 52340,
                revenue: 235530,
                roas: 4.5,
                conversions: 1456,
                impressions: 1200000,
                clicks: 45230,
                ctr: 3.77,
                cpa: 35.94
            }
        },
        {
            id: "meta_ads",
            name: "Meta Ads",
            icon: "fab fa-meta",
            connected: true,
            last_sync: "2024-12-12T14:20:00Z",
            metrics: {
                spend: 38450,
                revenue: 146110,
                roas: 3.8,
                conversions: 987,
                impressions: 890000,
                clicks: 32100,
                ctr: 3.61,
                cpa: 38.96
            }
        },
        {
            id: "tiktok_ads",
            name: "TikTok Ads",
            icon: "fab fa-tiktok",
            connected: true,
            last_sync: "2024-12-12T14:15:00Z",
            metrics: {
                spend: 18230,
                revenue: 76566,
                roas: 4.2,
                conversions: 623,
                impressions: 2100000,
                clicks: 78400,
                ctr: 3.73,
                cpa: 29.26
            }
        },
        {
            id: "linkedin_ads",
            name: "LinkedIn Ads",
            icon: "fab fa-linkedin",
            connected: true,
            last_sync: "2024-12-12T14:10:00Z",
            metrics: {
                spend: 15543,
                revenue: 45075,
                roas: 2.9,
                conversions: 781,
                impressions: 340000,
                clicks: 12890,
                ctr: 3.79,
                cpa: 19.90
            }
        }
    ],

    // ============================================
    // AUDIENCE SEGMENTS
    // ============================================
    segments: [
        {
            id: "seg_001",
            name: "High-Value Customers",
            description: "LTV > $500, Purchases > 3",
            size: 12450,
            color: "green"
        },
        {
            id: "seg_002",
            name: "At-Risk Churn",
            description: "No activity > 30 days, Previous customer",
            size: 3892,
            color: "amber"
        },
        {
            id: "seg_003",
            name: "Newsletter Subscribers",
            description: "Opted-in, Email verified",
            size: 89234,
            color: "blue"
        },
        {
            id: "seg_004",
            name: "Cart Abandoners",
            description: "Added to cart, No purchase > 24hrs",
            size: 5678,
            color: "purple"
        }
    ],

    // ============================================
    // AUTOMATION WORKFLOWS
    // ============================================
    automations: [
        {
            id: "auto_001",
            name: "New Lead Welcome Series",
            status: "active",
            trigger: { type: "event", event: "lead.created" },
            steps: 5,
            runs_today: 234,
            success_rate: 98.2
        },
        {
            id: "auto_002",
            name: "Cart Abandonment Recovery",
            status: "active",
            trigger: { type: "event", event: "cart.abandoned", delay: "1h" },
            steps: 3,
            runs_today: 89,
            recovery_rate: 12
        },
        {
            id: "auto_003",
            name: "Spend Anomaly Alert",
            status: "active",
            trigger: { type: "condition", condition: "spend > budget * 1.2" },
            steps: 1,
            runs_today: 3,
            success_rate: 100
        }
    ]
}

export default sampleData
