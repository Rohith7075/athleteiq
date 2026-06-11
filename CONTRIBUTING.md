# Contributing to AthleteIQ

Thank you for your interest in contributing to AthleteIQ! We welcome contributions from everyone.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## How to Contribute

### 1. Reporting Bugs
- Open an issue describing the bug
- Include steps to reproduce, expected behavior, and actual behavior
- Include screenshots if applicable
- Mention your browser, OS, and Node.js version

### 2. Suggesting Features
- Open an issue with the label `enhancement`
- Describe the feature, why it's needed, and how it should work
- Include mockups or examples if possible

### 3. Code Contributions

#### Setup
```bash
git clone https://code.swecha.org/Rohith-123/atheleteiq.git
cd atheleteiq/athleteiq
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

#### Making Changes
1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run `npm run build` to verify everything compiles
4. Run `npm run lint` to check code quality
5. Commit with a clear message: `git commit -m "feat: add your feature"`
6. Push: `git push origin feature/your-feature`
7. Open a Merge Request on the GitLab repository

### 4. Code Style
- Use TypeScript strictly — define types for all functions and props
- Use functional React components with hooks
- Use Tailwind CSS for styling (no raw CSS files except `globals.css`)
- Run `npm run lint` before committing

### 5. Pull Request Guidelines
- Keep PRs focused on a single change
- Write a clear description of what and why
- Reference any related issues
- Ensure the build passes

## Development Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run start` | Start production server |

## License

By contributing, you agree that your contributions will be licensed under the AGPLv3 License.