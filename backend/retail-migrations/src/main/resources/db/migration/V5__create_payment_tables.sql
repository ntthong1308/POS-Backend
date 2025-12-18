-- =============================================
-- Create Payment Transaction Table
-- =============================================

-- Payment Transaction
CREATE TABLE payment_transaction (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    transaction_code VARCHAR(100) NOT NULL UNIQUE,
    hoa_don_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(18,2) NOT NULL,
    transaction_date DATETIME2 NOT NULL,
    gateway_transaction_id VARCHAR(200),
    gateway_response TEXT,
    card_last4 VARCHAR(4),
    card_type VARCHAR(50),
    qr_code TEXT,
    e_wallet_provider VARCHAR(50),
    e_wallet_account VARCHAR(100),
    reconciliation_date DATETIME2,
    reconciliation_status VARCHAR(50),
    error_message TEXT,
    notes TEXT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    
    CONSTRAINT fk_payment_transaction_hoa_don 
        FOREIGN KEY (hoa_don_id) 
        REFERENCES hoa_don(id) 
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_payment_transaction_code ON payment_transaction(transaction_code);
CREATE INDEX idx_payment_transaction_invoice ON payment_transaction(hoa_don_id);
CREATE INDEX idx_payment_transaction_status ON payment_transaction(status);
CREATE INDEX idx_payment_transaction_date ON payment_transaction(transaction_date);

