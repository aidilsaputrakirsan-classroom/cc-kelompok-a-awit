-- ============================================================
-- Migration: Add vendor_id to master_blocks table
-- For existing databases that already have master_blocks table
-- ============================================================

-- Tambah kolom vendor_id ke master_blocks jika belum ada
ALTER TABLE IF EXISTS master_blocks
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES master_vendors(id) ON DELETE SET NULL;

-- Buat index untuk foreign key lookup
CREATE INDEX IF NOT EXISTS idx_blocks_vendor ON master_blocks(vendor_id);

-- Update sample data jika diperlukan
-- (sesuaikan dengan data vendor yang sudah ada di database)
