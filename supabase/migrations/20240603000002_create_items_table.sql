CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  assigned_to TEXT,
  split_percentage JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS receipt_items_receipt_id_idx ON receipt_items(receipt_id);

DROP POLICY IF EXISTS "Users can view their own receipt items" ON receipt_items;
CREATE POLICY "Users can view their own receipt items"
  ON receipt_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own receipt items" ON receipt_items;
CREATE POLICY "Users can insert their own receipt items"
  ON receipt_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own receipt items" ON receipt_items;
CREATE POLICY "Users can update their own receipt items"
  ON receipt_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own receipt items" ON receipt_items;
CREATE POLICY "Users can delete their own receipt items"
  ON receipt_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

alter publication supabase_realtime add table receipt_items;
