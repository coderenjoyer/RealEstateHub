-- ============================================================================
-- VERIFICATION SCRIPT FOR MESSENGER SETUP
-- Run this to verify all components are properly configured
-- ============================================================================

-- Check 1: Verify tables exist
SELECT 
    'Tables Check' as check_type,
    CASE 
        WHEN COUNT(*) = 3 THEN '✓ PASS'
        ELSE '✗ FAIL - Missing tables'
    END as status,
    array_agg(table_name) as tables_found
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'profiles');

-- Check 2: Verify function exists
SELECT 
    'Functions Check' as check_type,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS'
        ELSE '✗ FAIL - Missing function'
    END as status,
    array_agg(routine_name) as functions_found
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_or_create_conversation';

-- Check 3: Verify RLS is enabled
SELECT 
    'RLS Check' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✓ Enabled'
        ELSE '✗ Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'profiles');

-- Check 4: Verify RLS policies
SELECT 
    'RLS Policies Check' as check_type,
    tablename,
    COUNT(*) as policy_count,
    array_agg(policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'profiles')
GROUP BY tablename;

-- Check 5: Verify indexes
SELECT 
    'Indexes Check' as check_type,
    tablename,
    COUNT(*) as index_count,
    array_agg(indexname) as indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages')
GROUP BY tablename;

-- Check 6: Verify storage bucket
SELECT 
    'Storage Bucket Check' as check_type,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS'
        ELSE '✗ FAIL - Bucket not found'
    END as status,
    array_agg(name) as buckets_found
FROM storage.buckets
WHERE id = 'chat-media';

-- Check 7: Verify storage policies
SELECT 
    'Storage Policies Check' as check_type,
    COUNT(*) as policy_count,
    array_agg(policyname) as policies
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%chat%';

-- Summary
SELECT 
    '==============================================';
SELECT 
    'MESSENGER SETUP VERIFICATION COMPLETE';
SELECT 
    '==============================================';
SELECT 
    'Review the results above.';
SELECT 
    'All checks should show ✓ PASS or Enabled status.';
SELECT 
    '';
SELECT 
    'MANUAL CHECKS REQUIRED:';
SELECT 
    '1. Verify Realtime is enabled in Supabase Dashboard';
SELECT 
    '   Database > Replication > conversations, messages';
SELECT 
    '==============================================';
