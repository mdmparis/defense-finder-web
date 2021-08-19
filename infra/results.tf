resource "aws_s3_bucket" "results_bucket" {
  bucket = "df-results-bis"
  acl    = "private"

  lifecycle_rule {
    enabled = true
    expiration {
      days = local.results.ttl_days
    }
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
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
