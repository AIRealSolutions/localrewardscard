# Local Rewards Platform — TODO

## Phase 1: Database Schema
- [x] Extend users table with role enum (consumer, business_owner, admin)
- [x] Create businesses table (name, description, category, address, status, magicfishbowl_id)
- [x] Create loyalty_cards table (consumer_id, business_id, points_balance, tier)
- [x] Create transactions table (card_id, business_id, type, points, amount, description)
- [x] Create rewards_offers table (business_id, title, description, points_required, discount_type, discount_value, active)
- [x] Create patronage_milestones table (business_id, visit_count, reward_description, points_bonus)
- [x] Create redemptions table (card_id, offer_id, redeemed_at, status)
- [x] Create campaigns table (business_id, type, subject, body, status, scheduled_at, sent_at)
- [x] Create campaign_recipients table (campaign_id, consumer_id, status)
- [x] Apply all migrations via webdev_execute_sql

## Phase 2: Authentication & Onboarding
- [x] Extend role enum in users table (consumer, business_owner, admin)
- [x] Role selection screen after first login
- [x] Business owner onboarding wizard (business profile setup)
- [x] Consumer onboarding (name, preferences)
- [x] Role-based routing in App.tsx
- [x] Protected routes per role
- [x] Admin promotion via DB

## Phase 3: Consumer UI
- [x] Digital loyalty card display (points, tier, balance)
- [x] Transaction history view
- [x] Business discovery page (browse enrolled businesses)
- [x] magicfishbowl.com integration link/embed for discovery
- [x] Rewards catalog (available offers to redeem)
- [x] Redemption flow

## Phase 4: Business Back-Office Portal
- [x] Business dashboard (summary stats: customers, points issued, redemptions)
- [x] Customer list management (view, search, filter enrolled customers)
- [x] Offers & rewards creator (create/edit/delete offers)
- [x] Patronage milestone tracker (configure milestones, view customer progress)
- [x] Business profile editor

## Phase 5: Rewards Engine
- [x] Points accrual rules (per-dollar, per-visit, bonus events)
- [x] Points issuance API (business issues points to customer)
- [x] Milestone detection and reward triggering
- [x] Redemption flow (customer redeems offer, business confirms)
- [x] Points expiry logic (configurable per business)

## Phase 6: Customer Engagement Tools
- [x] Email campaign composer (subject, body, recipient selection)
- [x] SMS message composer (body, recipient selection)
- [x] Social media post builder (platform selector, preview, copy-to-clipboard)
- [x] Campaign history and status tracking
- [x] Send/schedule campaign

## Phase 7: Admin Panel
- [x] Enrolled businesses list with status management
- [x] Business approval / rejection workflow
- [x] Platform-wide analytics (total users, businesses, points issued, redemptions)
- [x] User management (view, role change)
- [x] magicfishbowl.com sync status

## Phase 8: Polish & Tests
- [x] Global design system (typography, colors, spacing tokens)
- [x] Responsive design across all pages
- [x] Loading states and error handling throughout
- [x] Vitest unit tests for routers (15 tests passing)
- [x] Final checkpoint and delivery
