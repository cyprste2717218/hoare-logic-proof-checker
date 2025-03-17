echo "pre-commit hook started (husky)"
echo "-------------------------------"
echo "running xo and prettier checks "
npm run lint
echo "running npm packages audit"
npm audit