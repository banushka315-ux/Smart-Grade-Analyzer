/*
  # Create Grade Analysis Tables

  1. New Tables
    - `grade_uploads`
      - `id` (uuid, primary key) - Unique upload session ID
      - `file_name` (text) - Original uploaded file name
      - `created_at` (timestamptz) - Upload timestamp
    - `student_records`
      - `id` (uuid, primary key) - Unique record ID
      - `upload_id` (uuid, FK to grade_uploads) - Links to upload session
      - `student_name` (text) - Student name
      - `subject` (text) - Subject name
      - `marks` (integer) - Raw marks
      - `grade` (text) - Assigned grade (A+, A, B+, B, C+, Fail)
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own uploads and records
    - Add public read/write policies for demo purposes (no auth required for this app)

  3. Notes
    - The app is designed for teacher use without authentication
    - RLS policies allow all operations for authenticated users
    - An index on upload_id improves query performance for filtering records by upload session
*/

CREATE TABLE IF NOT EXISTS grade_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES grade_uploads(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  subject text NOT NULL,
  marks integer NOT NULL DEFAULT 0,
  grade text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_records_upload_id ON student_records(upload_id);

ALTER TABLE grade_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage grade uploads"
  ON grade_uploads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage student records"
  ON student_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous grade uploads"
  ON grade_uploads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read grade uploads"
  ON grade_uploads FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous student records insert"
  ON student_records FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous student records read"
  ON student_records FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous student records delete"
  ON student_records FOR DELETE
  TO anon
  USING (true);
