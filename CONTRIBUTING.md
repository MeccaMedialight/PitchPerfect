# Contributing to PitchPerfect

Thank you for your interest in contributing to PitchPerfect! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/PitchPerfect.git
   cd PitchPerfect
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Start development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages
- Use clear, descriptive commit messages
- Follow conventional commit format:
  ```
  type(scope): description
  
  [optional body]
  [optional footer]
  ```
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run tests (when available)
   npm test
   
   # Test the application manually
   npm run dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template
   - Submit the PR

## 🐛 Reporting Issues

When reporting issues, please include:

- **Description**: Clear description of the problem
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

## 🎯 Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use case**: Why this feature would be useful
- **Mockups**: If applicable, include mockups or wireframes
- **Implementation ideas**: Any thoughts on how to implement

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions
- Update API documentation if endpoints change
- Include examples for new features

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass
- Test on different browsers and devices
- Test offline functionality

## 🔧 Development Tools

### Recommended Extensions
- ESLint
- Prettier
- React Developer Tools
- Node.js Debugger

### Useful Commands
```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📞 Getting Help

- Check existing issues and PRs
- Join our discussions
- Contact the maintainers

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to PitchPerfect! 🚀 