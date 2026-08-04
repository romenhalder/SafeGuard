# ============================================
# SAFEGUARD - Terraform Backend Configuration
# Remote state with S3 + DynamoDB locking
# ============================================

terraform {
  backend "s3" {
    bucket         = "safeguard-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "safeguard-terraform-lock"
  }
}
