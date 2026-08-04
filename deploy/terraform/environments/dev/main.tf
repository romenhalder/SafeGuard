# ============================================
# SAFEGUARD - Terraform Main (Dev Environment)
# ============================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# ═══════════════════════════════════════════
#  VPC
# ═══════════════════════════════════════════

module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.vpc_azs
  private_subnets    = var.vpc_private_subnets
  public_subnets     = var.vpc_public_subnets

  tags = var.tags
}

# ═══════════════════════════════════════════
#  EKS CLUSTER
# ═══════════════════════════════════════════

module "eks" {
  source = "../../modules/eks-cluster"

  cluster_name       = var.eks_cluster_name
  cluster_version    = var.eks_cluster_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_instance_types = var.eks_node_instance_types
  node_desired_size  = var.eks_node_desired_size
  node_min_size      = var.eks_node_min_size
  node_max_size      = var.eks_node_max_size

  tags = var.tags
}

# ═══════════════════════════════════════════
#  RDS POSTGRESQL + POSTGIS
# ═══════════════════════════════════════════

module "rds" {
  source = "../../modules/rds-postgres"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  vpc_cidr           = var.vpc_cidr
  instance_class     = var.rds_instance_class
  engine_version     = var.rds_engine_version
  allocated_storage  = var.rds_allocated_storage
  eks_security_group = module.eks.node_security_group_id

  tags = var.tags
}

# ═══════════════════════════════════════════
#  ELASTICACHE REDIS
# ═══════════════════════════════════════════

module "redis" {
  source = "../../modules/elasticache-redis"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  vpc_cidr           = var.vpc_cidr
  node_type          = var.redis_node_type
  num_cache_nodes    = var.redis_num_cache_nodes
  eks_security_group = module.eks.node_security_group_id

  tags = var.tags
}
