-- ============================================================
-- PalmChain Database Schema
-- Sistem Monitoring Rantai Pasok TBS (Tandan Buah Segar)
-- ============================================================

-- 1. Tabel Master Vendor
-- Menampung data vendor transport yang mengangkut TBS
CREATE TABLE IF NOT EXISTS master_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(100),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Master Blok
-- Menampung data lokasi/afdeling tempat TBS dipanen
CREATE TABLE IF NOT EXISTS master_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_code VARCHAR(10) UNIQUE NOT NULL,
    division VARCHAR(50),
    hectarage DECIMAL(10,2),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Transaksi Hauling
-- Menampung log setiap pengangkutan TBS dari blok ke PKS
CREATE TABLE IF NOT EXISTS hauling_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no VARCHAR(20) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES master_vendors(id) ON DELETE SET NULL,
    block_id UUID REFERENCES master_blocks(id) ON DELETE SET NULL,
    vehicle_plate VARCHAR(15) NOT NULL,
    weight_in DECIMAL(10,2) NOT NULL,
    weight_out DECIMAL(10,2) NOT NULL,
    net_weight DECIMAL(10,2) GENERATED ALWAYS AS (weight_in - weight_out) STORED,
    gate_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gate_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES untuk performa query
-- ============================================================

-- Index untuk frequent queries di dashboard
CREATE INDEX IF NOT EXISTS idx_hauling_date ON hauling_transactions(gate_in_time);
CREATE INDEX IF NOT EXISTS idx_hauling_vendor ON hauling_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_hauling_block ON hauling_transactions(block_id);
CREATE INDEX IF NOT EXISTS idx_hauling_status ON hauling_transactions(status);

-- ============================================================
-- SAMPLE DATA untuk testing
-- ============================================================

-- Insert sample vendors
INSERT INTO master_vendors (code, name, type, phone, email, status) VALUES
('VND001', 'PT Transportir Jaya', 'Transportir', '085123456789', 'jaya@transport.com', true),
('VND002', 'Kelompok Tani Maju', 'Petani Swadaya', '085234567890', 'keltan@tani.com', true),
('VND003', 'CV Inti Sejahtera', 'Inti', '085345678901', 'inti@sejahtera.com', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample blocks
INSERT INTO master_blocks (block_code, division, hectarage, status) VALUES
('BLK-A1', 'Afdeling 1', 50.00, true),
('BLK-A2', 'Afdeling 1', 45.50, true),
('BLK-B1', 'Afdeling 2', 60.25, true),
('BLK-B2', 'Afdeling 2', 55.75, true),
('BLK-C1', 'Afdeling 3', 48.00, true)
ON CONFLICT (block_code) DO NOTHING;

-- ============================================================
-- NOTES
-- ============================================================
-- - Ini adalah schema minimal untuk MVP PalmChain
-- - Supports: Master Data CRUD, Transaction Logging, Dashboard Aggregation
-- - Net weight dihitung automatic dengan GENERATED ALWAYS AS (weight_in - weight_out)
-- - Timestamps auto-populated dengan timezone awareness
