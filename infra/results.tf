resource "aws_s3_bucket" "results_bucket" {
  bucket = "df-results"
  acl    = "private"
}

resource "aws_iam_policy" "upload_to_results_policy" {
  name        = "upload-to-df-results"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "",
        Effect   = "Allow",
        Action   = "s3:PutObject",
        Resource = "${aws_s3_bucket.results_bucket.arn}/*"
      }
    ]
  })
}
