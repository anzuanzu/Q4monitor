# Q4monitor

## 第四季基金專案銷量目標

人員名單與目標資料位於 `data/q4_fund_project_sales_targets.csv`。

- 共 28 位人員。
- 金額以新台幣保存；`q4_fund_project_sales_target_twd` 為元，`q4_fund_project_sales_target_ten_thousand_twd` 為萬元。
- 新板分行名單已改列黃淑卿，未納入朱湘蘋。

## GitHub Pages + Supabase 績效系統

GitHub Pages 僅提供前端；實績資料、帳號登入與存取權皆儲存在 Supabase，**不會寫入 GitHub**。頁面支援：

- 電子郵件／密碼登入
- 分行、姓名篩選與共用雲端實績同步
- CSV 批次上傳（限 `admin` 或 `editor`）
- `viewer` 唯讀權限

### 一次性設定

1. 在 Supabase 建立專案，於 **SQL Editor** 完整執行 [`supabase/schema.sql`](supabase/schema.sql)。
2. 在 Supabase **Authentication → Users** 建立或邀請使用者。
3. 複製每位使用者的 UUID，於 SQL Editor 執行：

   ```sql
   insert into public.app_members (user_id, role)
   values ('使用者 UUID', 'admin');
   ```

   `role` 可用 `admin`、`editor` 或 `viewer`。
4. 在 [`docs/config.js`](docs/config.js) 填入 Supabase **Project URL** 與 **anon public key**。這兩者可公開；絕不可填入 `service_role` key。
5. 推送至 GitHub 的 `main` 分支。GitHub Pages 會從 `docs/` 發布。

CSV 欄位依序為：`分行,理專姓名,季責任額,季進度(含在途),季達成率,基金進度,保險進度`。
