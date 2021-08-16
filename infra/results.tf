resource "aws_s3_bucket" "results_bucket" {
  bucket = "df-results-bis"
  acl    = "private"

  lifecycle_rule {
    enabled = true
    expiration {
      days = 1
    }
  }
}

// Allow anyone to download a file. Do not grant list access or write access
data "aws_iam_policy_document" "public_read" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject"
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    resources = [
      "${aws_s3_bucket.results_bucket.arn}/*",
    ]
  }
}
resource "aws_s3_bucket_policy" "results_bucket_policy" {
  bucket = aws_s3_bucket.results_bucket.id
  policy = data.aws_iam_policy_document.public_read.json
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
