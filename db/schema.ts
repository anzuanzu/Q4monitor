export const performanceTableSql = `
  CREATE TABLE IF NOT EXISTS performance_records (
    branch TEXT NOT NULL,
    advisor_name TEXT NOT NULL,
    quarter_target TEXT NOT NULL DEFAULT '',
    quarter_progress TEXT NOT NULL DEFAULT '',
    quarter_rate TEXT NOT NULL DEFAULT '',
    fund_progress TEXT NOT NULL DEFAULT '',
    insurance_progress TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    PRIMARY KEY (branch, advisor_name)
  )
`;

export const performanceUpdatedIndexSql = `
  CREATE INDEX IF NOT EXISTS idx_performance_records_updated_at
  ON performance_records (updated_at)
`;
