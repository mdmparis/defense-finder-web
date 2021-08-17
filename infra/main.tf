terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
    archive = {
      source = "hashicorp/archive"
    }
  }

  required_version = ">= 0.14.9"

  backend "remote" {
    organization = "mdmparis"
    workspaces {
      name = "defense-finder-web"
    }
  }
}

provider "aws" {
  profile = "default"
  region  = "eu-west-3"
}

