# Productivity Tracking Setup Guide

## Overview

Your app now tracks daily productivity metrics, activity logs, and streaks. The backend schema and frontend integration are complete - you just need to create the database tables.

## 🚀 Setup Steps

### 1. Run the SQL Schema in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `PRODUCTIVITY_SCHEMA.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)

This will create:

- ✅ 5 new tables (daily_stats, activity_log, study_sessions, user_streaks, weekly_summary)
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers and functions
- ✅ Automatic daily stats updates

### 2. Verify Tables Were Created

After running the SQL:

1. Go to **Table Editor** in Supabase
2. You should see these new tables:
   - `daily_stats`
   - `activity_log`
   - `study_sessions`
   - `user_streaks`
   - `weekly_summary`

### 3. Test It Out

Once tables are created, your app will automatically:

- ✅ **Log activities** when you:
  - Complete a task
  - Add a new subject
  - Create a note
- ✅ **Update daily statistics** including:
  - Tasks completed/created/pending
  - Priority breakdown
  - Notes and subjects count
  - Productivity score

- ✅ **Track your streak**
  - Current consecutive days
  - Longest streak ever

## 📊 What You'll See on Dashboard

### 1. Streak Counter Card

Shows your current streak of consecutive productive days with a fire emoji 🔥

### 2. Recent Activity Feed

Displays your last 5 activities with:

- Activity type icons (✓ task, 📖 subject, 📝 note)
- Description
- Timestamp

### 3. Productivity Charts

Uses stored daily stats for better performance (no more on-the-fly calculations)

## 🔍 How It Works

### Activity Logging

Every time you complete a task, add a subject, or create a note, the app:

1. Calls `logActivity()` with activity details
2. Stores it in the `activity_log` table
3. Updates daily statistics automatically via database trigger

### Daily Stats Updates

The database function `update_daily_stats()`:

- Runs automatically when tasks are completed
- Aggregates all your daily activities
- Calculates productivity and consistency scores
- Stores in `daily_stats` table

### Streak Tracking

The app checks your activity patterns to:

- Increment current streak if you're active today
- Track your longest streak ever
- Display streak counter on dashboard

## 🎯 What's NOT Included (Optional Features)

As requested, these are NOT implemented yet:

- ⏱️ Study timer sessions
- 🏆 Achievement badges
- 📧 Weekly email digest

You can add these later if needed!

## 📝 Quick Reference

### Files Modified

- `src/types/database.ts` - Added productivity table types
- `src/types/index.ts` - Added frontend interfaces
- `src/contexts/DataContext.tsx` - Added productivity tracking functions
- `src/pages/Dashboard.tsx` - Added streak card and activity feed
- `PRODUCTIVITY_SCHEMA.sql` - Database schema (run this in Supabase!)

### Database Tables

**daily_stats** - Aggregated daily metrics

- Tasks completed, created, pending
- Priority breakdown
- Study metrics
- Productivity scores

**activity_log** - Audit trail of all activities

- What you did
- When you did it
- Related entity details

**user_streaks** - Consistency tracking

- Current streak
- Longest streak
- Streak dates

**study_sessions** - Time tracking (for future timer feature)

- Start/end times
- Subject studied
- Duration

**weekly_summary** - Pre-calculated weekly metrics

- Week-over-week comparison
- Performance trends

## ❓ Troubleshooting

### Tables not appearing?

- Make sure you're connected to the right Supabase project
- Check SQL editor for any error messages
- Verify your database user has CREATE TABLE permissions

### Activity feed empty?

- Normal for new users! Complete a task, add a subject, or create a note
- Check browser console for any errors
- Verify RLS policies allow reading activity_log

### Streak showing 0?

- Streaks start after your first productive day
- Complete at least one task today to start your streak
- Check user_streaks table in Supabase to verify data

## 🎉 You're All Set!

Once you run the SQL schema, your productivity tracking is fully functional. Start completing tasks and watch your metrics grow!
