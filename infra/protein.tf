resource "aws_s3_bucket" "proteins_bucket" {
  bucket = "df-proteins"
  acl    = "private"

  lifecycle_rule {
    enabled = true
    expiration {
      days = 1
    }
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_iam_policy" "read_proteins_policy" {
  name        = "read-df-proteins"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "",
        Effect   = "Allow",
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.proteins_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_notification" "protein_notification" {
  bucket = aws_s3_bucket.proteins_bucket.id

  lambda_function {
    lambda_function_arn = module.lambda_function_container_image.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
  }
}
