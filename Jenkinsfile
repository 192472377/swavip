pipeline {
    agent any

    environment {
        REGISTRY = "ghcr.io/192472377"
        IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build') {
            parallel {
                stage('inventory-service') {
                    steps { dir('services/inventory-service') { sh 'npm ci' } }
                }
                stage('warehouse-service') {
                    steps { dir('services/warehouse-service') { sh 'npm ci' } }
                }
                stage('api-gateway') {
                    steps { dir('services/api-gateway') { sh 'npm ci' } }
                }
                stage('frontend') {
                    steps { dir('frontend') { sh 'npm ci && npm run build' } }
                }
            }
        }

        stage('Test') {
            steps {
                dir('services/inventory-service') { sh 'npm test || true' }
            }
        }

        stage('Code Quality') {
            steps {
                sh 'npx eslint services/**/src/**/*.js || true'
            }
        }

        stage('Docker Build & Package') {
            steps {
                sh 'docker compose -f docker-compose.yml build'
            }
        }

        stage('Push Images') {
            when { branch 'develop' }
            steps {
                sh """
                    docker tag swavip-inventory-service:latest ${REGISTRY}/swavip-inventory-service:${IMAGE_TAG}
                    docker push ${REGISTRY}/swavip-inventory-service:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to Staging') {
            when { branch 'develop' }
            steps {
                sh 'docker compose -f docker-compose.yml up -d'
            }
        }

        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                input message: 'Approve production deployment?'
                sh 'docker compose -f docker-compose.yml up -d'
            }
        }
    }

    post {
        success { echo "Pipeline succeeded for ${env.BRANCH_NAME}" }
        failure { echo "Pipeline failed — check console output" }
    }
}