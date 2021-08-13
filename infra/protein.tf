resource "aws_s3_bucket" "proteins_bucket" {
  bucket = "df-proteins"
  acl    = "private"
}

#resource "aws_iam_role" "protein_upload_role" {
#name = "protein_upload_role"

#assume_role_policy = jsonencode({
#Version = "2012-10-17"
#Statement = [
#{
#Effect   = "Allow",
#Action   = "s3:PutObject",
#Sid      = "",
#Resource = "${aws_s3_bucket.proteins_bucket.arn}/*"
#}
#]
#})
#}

resource "aws_iam_policy" "upload-to-proteins-policy" {
  name        = "upload-to-df-proteins"
  path        = "/"
  description = ""

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "VisualEditor0",
        Effect   = "Allow",
        Action   = "s3:PutObject",
        Resource = "${aws_s3_bucket.proteins_bucket.arn}/*"
      }
    ]
  })
}
