#!/bin/bash

# Manual GitHub Pages Deployment Script
# This script builds the app and pushes to the gh-pages branch

set -e

echo "🚀 Starting GitHub Pages deployment..."

# Build the application
echo "📦 Building the application..."
npm run build

# Create gh-pages branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "🌿 Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
fi

# Copy build files to a temporary directory
echo "📋 Preparing deployment files..."
rm -rf temp_gh_pages
mkdir temp_gh_pages
cp -r dist/* temp_gh_pages/

# Switch to gh-pages branch and copy files
echo "🔄 Switching to gh-pages branch..."
git checkout gh-pages
rm -rf *
cp -r temp_gh_pages/* .

# Create .nojekyll file
touch .nojekyll

# Add and commit changes
echo "📝 Committing changes..."
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin gh-pages

# Clean up and return to main branch
echo "🧹 Cleaning up..."
rm -rf temp_gh_pages
git checkout main

echo "✅ Deployment complete! Your site should be available at https://[username].github.io/AI-Dashboard/ within a few minutes."
echo "📝 Don't forget to:"
echo "   1. Configure API keys as repository secrets"
echo "   2. Enable GitHub Pages in repository settings"
echo "   3. Set source to 'Deploy from a branch' -> 'gh-pages' -> '/(root)'"