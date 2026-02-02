-- OWNLAY Seed Data
-- Demo users, influencers, and sample data

-- Insert demo brand users (passwords are hashed versions of the demo passwords)
-- For demo: we'll use plain text and hash in the API
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, company, role, account_type, plan) VALUES
  ('usr_admin', 'admin@ownlay.app', 'Admin123!', 'Admin', 'User', 'OWNLAY', 'admin', 'admin', 'enterprise'),
  ('usr_agency', 'agency@demo.com', 'Agency123!', 'Agency', 'Owner', 'Demo Agency', 'agency_owner', 'agency', 'pro'),
  ('usr_brand_starter', 'starter@demo.com', 'Demo123!', 'Starter', 'Brand', 'Starter Co', 'brand_owner', 'brand', 'starter'),
  ('usr_brand_growth', 'growth@demo.com', 'Demo123!', 'Growth', 'Brand', 'Growth Inc', 'brand_owner', 'brand', 'growth'),
  ('usr_brand_pro', 'pro@demo.com', 'Demo123!', 'Pro', 'Brand', 'Pro Corp', 'brand_owner', 'brand', 'pro'),
  ('usr_brand_enterprise', 'enterprise@demo.com', 'Demo123!', 'Enterprise', 'Brand', 'Enterprise LLC', 'brand_owner', 'brand', 'enterprise');

-- Insert demo influencers
INSERT OR IGNORE INTO influencers (id, email, password_hash, username, first_name, last_name, bio, category, location, tier, verified, total_followers, avg_engagement, total_earnings) VALUES
  ('inf_sarah_j', 'sarah@creator.com', 'Creator123!', 'sarahstyle', 'Sarah', 'Johnson', 'Fashion & lifestyle content creator', 'Fashion', 'Los Angeles, CA', 'pro', 1, 520000, 5.3, 85000),
  ('inf_mike_t', 'mike@creator.com', 'Creator123!', 'mikethetechy', 'Mike', 'Thompson', 'Tech reviews and tutorials', 'Technology', 'San Francisco, CA', 'standard', 1, 320000, 4.8, 45000),
  ('inf_emma_f', 'emma@creator.com', 'Creator123!', 'emmafitlife', 'Emma', 'Chen', 'Fitness and wellness inspiration', 'Fitness', 'Miami, FL', 'standard', 1, 180000, 6.2, 32000),
  ('inf_alex_c', 'alex@creator.com', 'Creator123!', 'alexcooks', 'Alex', 'Rodriguez', 'Food and cooking content', 'Food', 'Austin, TX', 'standard', 0, 95000, 5.7, 15000),
  ('inf_lisa_t', 'lisa@creator.com', 'Creator123!', 'lisatravels', 'Lisa', 'Park', 'Travel and adventure vlogs', 'Travel', 'New York, NY', 'pro', 1, 420000, 4.5, 72000);

-- Insert connected platforms for influencers
INSERT OR IGNORE INTO influencer_platforms (id, influencer_id, platform, username, profile_url, followers, engagement_rate) VALUES
  -- Sarah's platforms
  ('plat_sarah_ig', 'inf_sarah_j', 'instagram', 'sarahstyle', 'https://instagram.com/sarahstyle', 245000, 5.8),
  ('plat_sarah_tt', 'inf_sarah_j', 'tiktok', 'sarahstyle', 'https://tiktok.com/@sarahstyle', 180000, 6.2),
  ('plat_sarah_yt', 'inf_sarah_j', 'youtube', 'SarahStyle', 'https://youtube.com/@sarahstyle', 95000, 4.1),
  -- Mike's platforms
  ('plat_mike_yt', 'inf_mike_t', 'youtube', 'MikeTheTech', 'https://youtube.com/@mikethetechy', 220000, 5.2),
  ('plat_mike_tw', 'inf_mike_t', 'twitter', 'mikethetechy', 'https://twitter.com/mikethetechy', 100000, 3.8),
  -- Emma's platforms
  ('plat_emma_ig', 'inf_emma_f', 'instagram', 'emmafitlife', 'https://instagram.com/emmafitlife', 120000, 7.1),
  ('plat_emma_tt', 'inf_emma_f', 'tiktok', 'emmafitlife', 'https://tiktok.com/@emmafitlife', 60000, 5.4),
  -- Alex's platforms
  ('plat_alex_ig', 'inf_alex_c', 'instagram', 'alexcooks', 'https://instagram.com/alexcooks', 65000, 6.2),
  ('plat_alex_yt', 'inf_alex_c', 'youtube', 'AlexCooks', 'https://youtube.com/@alexcooks', 30000, 4.8),
  -- Lisa's platforms
  ('plat_lisa_ig', 'inf_lisa_t', 'instagram', 'lisatravels', 'https://instagram.com/lisatravels', 280000, 4.2),
  ('plat_lisa_yt', 'inf_lisa_t', 'youtube', 'LisaTravels', 'https://youtube.com/@lisatravels', 140000, 5.1);

-- Insert sample opportunities
INSERT OR IGNORE INTO opportunities (id, brand_id, title, description, category, platform, budget_min, budget_max, status) VALUES
  ('opp_1', 'usr_brand_pro', 'Summer Fashion Campaign', 'Looking for fashion influencers for our summer collection launch', 'Fashion', 'instagram', 2000, 5000, 'open'),
  ('opp_2', 'usr_brand_pro', 'Tech Product Review', 'Need tech reviewers for our new smartphone accessories', 'Technology', 'youtube', 1500, 3000, 'open'),
  ('opp_3', 'usr_brand_growth', 'Fitness Challenge Promotion', 'Promote our 30-day fitness challenge app', 'Fitness', 'tiktok', 1000, 2500, 'open'),
  ('opp_4', 'usr_brand_enterprise', 'Food Festival Coverage', 'Cover our annual food festival event', 'Food', 'instagram', 3000, 7000, 'open'),
  ('opp_5', 'usr_agency', 'Travel Destination Campaign', 'Showcase luxury travel destinations', 'Travel', 'youtube', 5000, 10000, 'open');

-- Insert sample conversations
INSERT OR IGNORE INTO conversations (id, brand_id, influencer_id, campaign_name, campaign_budget, status, unread_count) VALUES
  ('conv_demo_1', 'usr_brand_pro', 'inf_sarah_j', 'Q1 2025 Fashion Launch', '$5,000', 'active', 2),
  ('conv_demo_2', 'usr_brand_growth', 'inf_emma_f', 'Fitness App Promotion', '$2,500', 'active', 1);

-- Insert sample messages
INSERT OR IGNORE INTO messages (id, conversation_id, sender_type, sender_id, content, read) VALUES
  ('msg_1', 'conv_demo_1', 'brand', 'usr_brand_pro', 'Hi Sarah! We love your content and would like to collaborate on our Q1 fashion launch.', 1),
  ('msg_2', 'conv_demo_1', 'influencer', 'inf_sarah_j', 'Thank you! I would love to hear more about the campaign details.', 1),
  ('msg_3', 'conv_demo_1', 'brand', 'usr_brand_pro', 'Great! We are looking for 3 Instagram posts and 2 TikTok videos. Budget is $5,000.', 0),
  ('msg_4', 'conv_demo_2', 'brand', 'usr_brand_growth', 'Hi Emma! Your fitness content is amazing. Would you be interested in promoting our new app?', 0);

-- Insert sample campaigns
INSERT OR IGNORE INTO campaigns (id, brand_id, influencer_id, name, description, budget, status, start_date, end_date) VALUES
  ('camp_1', 'usr_brand_pro', 'inf_sarah_j', 'Holiday Fashion Collection', 'Winter holiday fashion showcase', 8000, 'completed', '2024-11-15', '2024-12-20'),
  ('camp_2', 'usr_brand_pro', 'inf_sarah_j', 'Spring Preview', 'Early spring collection preview', 5000, 'active', '2025-01-01', '2025-02-28'),
  ('camp_3', 'usr_brand_growth', 'inf_emma_f', 'New Year Fitness Challenge', 'Promote fitness challenge', 3000, 'pending', '2025-01-15', '2025-02-15');

-- Insert sample earnings
INSERT OR IGNORE INTO influencer_earnings (id, influencer_id, campaign_id, amount, type, status, description) VALUES
  ('earn_1', 'inf_sarah_j', 'camp_1', 8000, 'campaign', 'completed', 'Holiday Fashion Collection - Full payment'),
  ('earn_2', 'inf_sarah_j', 'camp_2', 2500, 'campaign', 'processing', 'Spring Preview - 50% advance'),
  ('earn_3', 'inf_emma_f', 'camp_3', 1500, 'campaign', 'pending', 'New Year Fitness Challenge - 50% advance');

-- ============================================
-- MARKETING DATA FOR DEMO ACCOUNTS
-- ============================================

-- Insert brand integrations (connected platforms)
INSERT OR IGNORE INTO brand_integrations (id, user_id, platform, access_token, account_id, account_name, connected) VALUES
  -- Pro account integrations
  ('int_pro_google', 'usr_brand_pro', 'google_ads', 'demo_token_google', 'GA-123456789', 'Pro Corp Google Ads', 1),
  ('int_pro_meta', 'usr_brand_pro', 'meta_ads', 'demo_token_meta', 'MA-987654321', 'Pro Corp Meta Ads', 1),
  ('int_pro_shopify', 'usr_brand_pro', 'shopify', 'demo_token_shopify', 'SH-456789123', 'Pro Corp Store', 1),
  -- Enterprise account integrations
  ('int_ent_google', 'usr_brand_enterprise', 'google_ads', 'demo_token_google', 'GA-111222333', 'Enterprise LLC Google', 1),
  ('int_ent_meta', 'usr_brand_enterprise', 'meta_ads', 'demo_token_meta', 'MA-444555666', 'Enterprise LLC Meta', 1),
  ('int_ent_shopify', 'usr_brand_enterprise', 'shopify', 'demo_token_shopify', 'SH-777888999', 'Enterprise Store', 1),
  ('int_ent_woo', 'usr_brand_enterprise', 'woocommerce', 'demo_token_woo', 'WC-123123123', 'Enterprise WooCommerce', 1),
  -- Agency account integrations
  ('int_agency_google', 'usr_agency', 'google_ads', 'demo_token_google', 'GA-999888777', 'Demo Agency Google', 1),
  ('int_agency_meta', 'usr_agency', 'meta_ads', 'demo_token_meta', 'MA-666555444', 'Demo Agency Meta', 1);

-- Insert marketing campaigns for Pro account
INSERT OR IGNORE INTO marketing_campaigns (id, user_id, name, status, objective, platforms, budget_daily, budget_total, start_date, end_date) VALUES
  ('mcamp_pro_1', 'usr_brand_pro', 'Q4 Holiday Sale', 'active', 'conversions', '["google_ads", "meta_ads"]', 500, 15000, '2024-11-01', '2024-12-31'),
  ('mcamp_pro_2', 'usr_brand_pro', 'Brand Awareness 2025', 'active', 'awareness', '["meta_ads"]', 200, 6000, '2025-01-01', '2025-03-31'),
  ('mcamp_pro_3', 'usr_brand_pro', 'Product Launch - Spring', 'draft', 'traffic', '["google_ads"]', 300, 9000, '2025-03-01', '2025-04-30'),
  -- Enterprise campaigns
  ('mcamp_ent_1', 'usr_brand_enterprise', 'Enterprise Holiday Campaign', 'active', 'conversions', '["google_ads", "meta_ads"]', 2000, 60000, '2024-11-01', '2024-12-31'),
  ('mcamp_ent_2', 'usr_brand_enterprise', 'Global Brand Push', 'active', 'awareness', '["google_ads", "meta_ads"]', 1500, 45000, '2025-01-01', '2025-06-30'),
  -- Agency campaigns
  ('mcamp_agency_1', 'usr_agency', 'Client A - Performance Max', 'active', 'conversions', '["google_ads"]', 800, 24000, '2024-10-01', '2024-12-31'),
  ('mcamp_agency_2', 'usr_agency', 'Client B - Social Awareness', 'active', 'awareness', '["meta_ads"]', 600, 18000, '2024-11-15', '2025-02-15');

-- Insert marketing ads
INSERT OR IGNORE INTO marketing_ads (id, campaign_id, user_id, name, platform, status, ad_type, headline, description, cta) VALUES
  -- Pro account ads
  ('mad_pro_1', 'mcamp_pro_1', 'usr_brand_pro', 'Holiday Sale - Search', 'google_ads', 'active', 'search', 'Up to 50% Off Holiday Sale', 'Shop our biggest sale of the year. Premium products at unbeatable prices.', 'Shop Now'),
  ('mad_pro_2', 'mcamp_pro_1', 'usr_brand_pro', 'Holiday Sale - Display', 'google_ads', 'active', 'display', 'Exclusive Holiday Deals', 'Limited time offers on top products. Free shipping on orders over $50.', 'Get Deal'),
  ('mad_pro_3', 'mcamp_pro_1', 'usr_brand_pro', 'Holiday Sale - Meta Feed', 'meta_ads', 'active', 'image', 'Make This Holiday Special', 'Find the perfect gifts at amazing prices. Shop our holiday collection now.', 'Shop Sale'),
  ('mad_pro_4', 'mcamp_pro_2', 'usr_brand_pro', 'Brand Story - Video', 'meta_ads', 'active', 'video', 'Our Story', 'Discover what makes us different. Quality, sustainability, innovation.', 'Learn More'),
  -- Enterprise ads
  ('mad_ent_1', 'mcamp_ent_1', 'usr_brand_enterprise', 'Enterprise Holiday - Search', 'google_ads', 'active', 'search', 'Premium Enterprise Solutions', 'Industry-leading products for enterprise customers.', 'Get Quote'),
  ('mad_ent_2', 'mcamp_ent_1', 'usr_brand_enterprise', 'Enterprise Holiday - Meta', 'meta_ads', 'active', 'carousel', 'Enterprise Excellence', 'Trusted by Fortune 500 companies worldwide.', 'Contact Us'),
  -- Agency ads
  ('mad_agency_1', 'mcamp_agency_1', 'usr_agency', 'Client A - PMax Creative', 'google_ads', 'active', 'display', 'Performance Maximized', 'Achieve more with less. Data-driven results.', 'Start Now'),
  ('mad_agency_2', 'mcamp_agency_2', 'usr_agency', 'Client B - Social Video', 'meta_ads', 'active', 'video', 'See The Difference', 'Transforming businesses through innovation.', 'Watch Now');

-- Insert marketing metrics (last 30 days of data for each platform)
-- Pro account metrics - Google Ads
INSERT OR IGNORE INTO marketing_metrics (id, user_id, campaign_id, ad_id, platform, date, impressions, clicks, conversions, spend, revenue, ctr, cpa, roas) VALUES
  ('mm_pro_g_01', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-30 days'), 45000, 1800, 85, 450, 2125, 4.0, 5.29, 4.72),
  ('mm_pro_g_02', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-29 days'), 48000, 1920, 92, 480, 2300, 4.0, 5.22, 4.79),
  ('mm_pro_g_03', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-28 days'), 52000, 2080, 104, 520, 2600, 4.0, 5.0, 5.0),
  ('mm_pro_g_04', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-27 days'), 49000, 1960, 98, 490, 2450, 4.0, 5.0, 5.0),
  ('mm_pro_g_05', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-26 days'), 55000, 2200, 110, 550, 2750, 4.0, 5.0, 5.0),
  ('mm_pro_g_06', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-25 days'), 58000, 2320, 116, 580, 2900, 4.0, 5.0, 5.0),
  ('mm_pro_g_07', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-24 days'), 53000, 2120, 106, 530, 2650, 4.0, 5.0, 5.0),
  ('mm_pro_g_08', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-23 days'), 51000, 2040, 102, 510, 2550, 4.0, 5.0, 5.0),
  ('mm_pro_g_09', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-22 days'), 56000, 2240, 112, 560, 2800, 4.0, 5.0, 5.0),
  ('mm_pro_g_10', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-21 days'), 60000, 2400, 120, 600, 3000, 4.0, 5.0, 5.0),
  ('mm_pro_g_11', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-20 days'), 62000, 2480, 124, 620, 3100, 4.0, 5.0, 5.0),
  ('mm_pro_g_12', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-19 days'), 58000, 2320, 116, 580, 2900, 4.0, 5.0, 5.0),
  ('mm_pro_g_13', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-18 days'), 55000, 2200, 110, 550, 2750, 4.0, 5.0, 5.0),
  ('mm_pro_g_14', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-17 days'), 52000, 2080, 104, 520, 2600, 4.0, 5.0, 5.0),
  ('mm_pro_g_15', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-16 days'), 48000, 1920, 96, 480, 2400, 4.0, 5.0, 5.0),
  ('mm_pro_g_16', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-15 days'), 54000, 2160, 108, 540, 2700, 4.0, 5.0, 5.0),
  ('mm_pro_g_17', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-14 days'), 57000, 2280, 114, 570, 2850, 4.0, 5.0, 5.0),
  ('mm_pro_g_18', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-13 days'), 59000, 2360, 118, 590, 2950, 4.0, 5.0, 5.0),
  ('mm_pro_g_19', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-12 days'), 61000, 2440, 122, 610, 3050, 4.0, 5.0, 5.0),
  ('mm_pro_g_20', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-11 days'), 63000, 2520, 126, 630, 3150, 4.0, 5.0, 5.0),
  ('mm_pro_g_21', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-10 days'), 65000, 2600, 130, 650, 3250, 4.0, 5.0, 5.0),
  ('mm_pro_g_22', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-9 days'), 68000, 2720, 136, 680, 3400, 4.0, 5.0, 5.0),
  ('mm_pro_g_23', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-8 days'), 70000, 2800, 140, 700, 3500, 4.0, 5.0, 5.0),
  ('mm_pro_g_24', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-7 days'), 72000, 2880, 144, 720, 3600, 4.0, 5.0, 5.0),
  ('mm_pro_g_25', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-6 days'), 74000, 2960, 148, 740, 3700, 4.0, 5.0, 5.0),
  ('mm_pro_g_26', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-5 days'), 76000, 3040, 152, 760, 3800, 4.0, 5.0, 5.0),
  ('mm_pro_g_27', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-4 days'), 78000, 3120, 156, 780, 3900, 4.0, 5.0, 5.0),
  ('mm_pro_g_28', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-3 days'), 80000, 3200, 160, 800, 4000, 4.0, 5.0, 5.0),
  ('mm_pro_g_29', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-2 days'), 82000, 3280, 164, 820, 4100, 4.0, 5.0, 5.0),
  ('mm_pro_g_30', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_1', 'google_ads', date('now', '-1 days'), 85000, 3400, 170, 850, 4250, 4.0, 5.0, 5.0);

-- Pro account metrics - Meta Ads
INSERT OR IGNORE INTO marketing_metrics (id, user_id, campaign_id, ad_id, platform, date, impressions, clicks, conversions, spend, revenue, ctr, cpa, roas) VALUES
  ('mm_pro_m_01', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-30 days'), 65000, 2275, 91, 350, 1820, 3.5, 3.85, 5.2),
  ('mm_pro_m_02', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-29 days'), 68000, 2380, 95, 365, 1900, 3.5, 3.84, 5.21),
  ('mm_pro_m_03', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-28 days'), 72000, 2520, 101, 385, 2020, 3.5, 3.81, 5.25),
  ('mm_pro_m_04', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-27 days'), 70000, 2450, 98, 375, 1960, 3.5, 3.83, 5.23),
  ('mm_pro_m_05', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-26 days'), 75000, 2625, 105, 400, 2100, 3.5, 3.81, 5.25),
  ('mm_pro_m_06', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-25 days'), 78000, 2730, 109, 415, 2180, 3.5, 3.81, 5.25),
  ('mm_pro_m_07', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-24 days'), 74000, 2590, 104, 395, 2080, 3.5, 3.80, 5.27),
  ('mm_pro_m_08', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-23 days'), 71000, 2485, 99, 380, 1980, 3.5, 3.84, 5.21),
  ('mm_pro_m_09', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-22 days'), 76000, 2660, 106, 405, 2120, 3.5, 3.82, 5.23),
  ('mm_pro_m_10', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-21 days'), 80000, 2800, 112, 425, 2240, 3.5, 3.79, 5.27),
  ('mm_pro_m_11', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-20 days'), 82000, 2870, 115, 435, 2300, 3.5, 3.78, 5.29),
  ('mm_pro_m_12', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-19 days'), 79000, 2765, 111, 420, 2220, 3.5, 3.78, 5.29),
  ('mm_pro_m_13', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-18 days'), 75000, 2625, 105, 400, 2100, 3.5, 3.81, 5.25),
  ('mm_pro_m_14', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-17 days'), 73000, 2555, 102, 390, 2040, 3.5, 3.82, 5.23),
  ('mm_pro_m_15', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-16 days'), 70000, 2450, 98, 375, 1960, 3.5, 3.83, 5.23),
  ('mm_pro_m_16', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-15 days'), 74000, 2590, 104, 395, 2080, 3.5, 3.80, 5.27),
  ('mm_pro_m_17', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-14 days'), 77000, 2695, 108, 410, 2160, 3.5, 3.80, 5.27),
  ('mm_pro_m_18', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-13 days'), 79000, 2765, 111, 420, 2220, 3.5, 3.78, 5.29),
  ('mm_pro_m_19', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-12 days'), 81000, 2835, 113, 430, 2260, 3.5, 3.81, 5.26),
  ('mm_pro_m_20', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-11 days'), 83000, 2905, 116, 440, 2320, 3.5, 3.79, 5.27),
  ('mm_pro_m_21', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-10 days'), 85000, 2975, 119, 450, 2380, 3.5, 3.78, 5.29),
  ('mm_pro_m_22', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-9 days'), 88000, 3080, 123, 465, 2460, 3.5, 3.78, 5.29),
  ('mm_pro_m_23', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-8 days'), 90000, 3150, 126, 475, 2520, 3.5, 3.77, 5.31),
  ('mm_pro_m_24', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-7 days'), 92000, 3220, 129, 485, 2580, 3.5, 3.76, 5.32),
  ('mm_pro_m_25', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-6 days'), 94000, 3290, 132, 495, 2640, 3.5, 3.75, 5.33),
  ('mm_pro_m_26', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-5 days'), 96000, 3360, 134, 505, 2680, 3.5, 3.77, 5.31),
  ('mm_pro_m_27', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-4 days'), 98000, 3430, 137, 515, 2740, 3.5, 3.76, 5.32),
  ('mm_pro_m_28', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-3 days'), 100000, 3500, 140, 525, 2800, 3.5, 3.75, 5.33),
  ('mm_pro_m_29', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-2 days'), 102000, 3570, 143, 535, 2860, 3.5, 3.74, 5.35),
  ('mm_pro_m_30', 'usr_brand_pro', 'mcamp_pro_1', 'mad_pro_3', 'meta_ads', date('now', '-1 days'), 105000, 3675, 147, 550, 2940, 3.5, 3.74, 5.35);

-- Insert AI insights for demo
INSERT OR IGNORE INTO ai_insights (id, user_id, insight_type, title, description, impact, confidence, action_type, status) VALUES
  ('ins_pro_1', 'usr_brand_pro', 'opportunity', 'Budget Reallocation Opportunity', 'Shift 15% budget from Google Search to Meta Retargeting for better ROAS', '+$2,340/month revenue', 91, 'reallocate_budget', 'pending'),
  ('ins_pro_2', 'usr_brand_pro', 'opportunity', 'Audience Expansion', 'Your lookalike audiences on Meta show 2.3x higher conversion probability', '+18% conversions', 87, 'expand_audience', 'pending'),
  ('ins_pro_3', 'usr_brand_pro', 'warning', 'Creative Fatigue Detected', 'Holiday Sale - Meta Feed ad showing 15% CTR decline over 2 weeks', '-$890 if not addressed', 84, 'refresh_creative', 'pending'),
  ('ins_pro_4', 'usr_brand_pro', 'anomaly', 'Spend Spike Detected', 'Google Ads spend increased 45% yesterday without corresponding conversion increase', 'Investigate immediately', 92, 'investigate', 'pending'),
  ('ins_pro_5', 'usr_brand_pro', 'recommendation', 'Bid Strategy Optimization', 'Switch to Target ROAS bidding for Q4 Holiday Sale campaign', '+15% efficiency', 86, 'optimize_bidding', 'pending'),
  ('ins_ent_1', 'usr_brand_enterprise', 'opportunity', 'Scale High-Performers', 'Top 3 campaigns have consistent 6x ROAS - increase budget by 30%', '+$12,500/month', 94, 'scale_campaigns', 'pending'),
  ('ins_ent_2', 'usr_brand_enterprise', 'warning', 'Budget Pacing Issue', 'Enterprise Holiday Campaign spending 120% of daily budget', 'Review budget settings', 88, 'adjust_budget', 'pending');

-- Insert audience segments
INSERT OR IGNORE INTO audience_segments (id, user_id, name, description, segment_type, size, color) VALUES
  ('seg_pro_1', 'usr_brand_pro', 'High-Value Customers', 'Customers with LTV > $500', 'custom', 12450, 'emerald'),
  ('seg_pro_2', 'usr_brand_pro', 'Cart Abandoners', 'Users who abandoned cart in last 30 days', 'retargeting', 8920, 'amber'),
  ('seg_pro_3', 'usr_brand_pro', 'Email Subscribers', 'Active email list subscribers', 'custom', 45670, 'blue'),
  ('seg_pro_4', 'usr_brand_pro', 'Lookalike - Purchasers', '1% lookalike of past purchasers', 'lookalike', 2100000, 'purple'),
  ('seg_ent_1', 'usr_brand_enterprise', 'Enterprise Decision Makers', 'C-level and VP titles', 'custom', 34500, 'indigo'),
  ('seg_ent_2', 'usr_brand_enterprise', 'Website Visitors 30d', 'All website visitors in last 30 days', 'retargeting', 156000, 'rose');

-- Insert creative assets
INSERT OR IGNORE INTO creative_assets (id, user_id, name, asset_type, dimensions, format, performance_score, used_in_ads) VALUES
  ('asset_pro_1', 'usr_brand_pro', 'Holiday Banner 2024', 'image', '1200x628', 'jpg', 8.7, 5),
  ('asset_pro_2', 'usr_brand_pro', 'Product Video 30s', 'video', '1080x1080', 'mp4', 9.2, 3),
  ('asset_pro_3', 'usr_brand_pro', 'Brand Story 15s', 'video', '1920x1080', 'mp4', 8.5, 2),
  ('asset_pro_4', 'usr_brand_pro', 'Carousel Template', 'template', '1080x1080', 'psd', 7.8, 8),
  ('asset_ent_1', 'usr_brand_enterprise', 'Enterprise Hero Video', 'video', '1920x1080', 'mp4', 9.5, 12),
  ('asset_ent_2', 'usr_brand_enterprise', 'Product Showcase', 'image', '1200x628', 'png', 8.9, 7);

-- Insert automation workflows
INSERT OR IGNORE INTO automation_workflows (id, user_id, name, description, status, trigger_type, runs_today, total_runs, success_rate) VALUES
  ('wf_pro_1', 'usr_brand_pro', 'Budget Alert', 'Alert when daily spend exceeds $600', 'active', 'condition', 3, 45, 98.5),
  ('wf_pro_2', 'usr_brand_pro', 'Performance Report', 'Daily performance summary at 9am', 'active', 'schedule', 1, 30, 100),
  ('wf_pro_3', 'usr_brand_pro', 'Low ROAS Pause', 'Pause ads with ROAS below 2x for 3 days', 'active', 'condition', 0, 12, 91.7),
  ('wf_ent_1', 'usr_brand_enterprise', 'Cross-Platform Sync', 'Sync budgets across all platforms', 'active', 'schedule', 4, 120, 99.2),
  ('wf_ent_2', 'usr_brand_enterprise', 'Anomaly Detection', 'Alert on unusual spend patterns', 'active', 'event', 2, 89, 96.3);

-- Insert user settings
INSERT OR IGNORE INTO user_settings (id, user_id, currency, locale, timezone, brand_guidelines) VALUES
  ('settings_usr_brand_pro', 'usr_brand_pro', 'USD', 'en-US', 'America/New_York', '{"primaryColor":"#6366f1","secondaryColor":"#8b5cf6","fontFamily":"Inter","logoUrl":null}'),
  ('settings_usr_brand_enterprise', 'usr_brand_enterprise', 'USD', 'en-US', 'America/Los_Angeles', '{"primaryColor":"#1e40af","secondaryColor":"#3b82f6","fontFamily":"Inter","logoUrl":null}'),
  ('settings_usr_agency', 'usr_agency', 'USD', 'en-US', 'America/Chicago', '{"primaryColor":"#059669","secondaryColor":"#10b981","fontFamily":"Inter","logoUrl":null}');
