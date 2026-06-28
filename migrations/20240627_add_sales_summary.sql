-- Add sales summary function
CREATE OR REPLACE FUNCTION fn_sales_summary()
RETURNS TABLE(
  total_sales bigint,
  profit_yesterday numeric,
  total_earnings numeric
) AS $$
  SELECT COUNT(*) AS total_sales,
         SUM(amount) FILTER (WHERE created_at::date = (current_date - interval '1 day')) AS profit_yesterday,
         SUM(amount) AS total_earnings
  FROM training_transactions;
$$ LANGUAGE sql STABLE;
