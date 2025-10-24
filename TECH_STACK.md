# Technology Stack - PawfectMatch Premium

## Current Versions (Production Stable)

| Technology | Version | Status | Notes |
|------------|---------|--------|-------|
| React | 18.2.0 | ✅ Stable | Production-ready, no migration planned |
| React DOM | 18.2.0 | ✅ Stable | Matches React version |
| Next.js | 14.2.33 | ✅ Stable | Compatible with React 18 |
| TypeScript | 5.9.2 | ✅ Stable | Full type safety |
| Node.js | 20+ | ✅ Stable | LTS version |
| MongoDB | 6.18.0 | ✅ Stable | Latest stable |
| React Native | 0.72.10 | ✅ Stable | Mobile development |
| Expo SDK | ~49.0.23 | ✅ Stable | React Native framework |

## Why React 18.2.0?

- **Stability**: Battle-tested in production
- **Ecosystem**: All dependencies compatible
- **Performance**: Optimized and reliable
- **Support**: Long-term support from React team
- **No Breaking Changes**: Avoids React 19 migration complexity

## Future Considerations

- **React 18.3.1**: Minor update with deprecation warnings (optional)
- **React 19**: Not planned - staying with React 18 for stability
- **Next.js 15**: Consider when React 18.3.1 is stable

## Migration Policy

**Current Policy**: Stay with React 18.2.0 for production stability

**Future**: Evaluate React 19 only when:
1. All dependencies fully support React 19
2. Breaking changes are minimal
3. Clear business value for migration

## Package Manager

- **pnpm**: 9.15.0 (Monorepo management)
- **Workspaces**: apps/*, packages/*, server, ai-service

## Development Tools

- **ESLint**: 8.57.1 (Code quality)
- **Prettier**: 3.6.2 (Code formatting)
- **Jest**: 29.7.0 (Testing)
- **Cypress**: 15.3.0 (E2E testing)
- **Playwright**: 1.40.0 (E2E testing)
- **Turbo**: 2.3.3 (Build system)

## Build & Deployment

- **Docker**: Production containerization
- **Nginx**: Reverse proxy and static serving
- **PM2**: Process management
- **GitHub Actions**: CI/CD pipeline

## Security

- **Helmet**: Security headers
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API protection
- **Input Validation**: Zod schemas

## Monitoring & Analytics

- **Sentry**: Error tracking
- **Lighthouse**: Performance auditing
- **Web Vitals**: Core web vitals monitoring

---

**Last Updated**: January 2025  
**Policy Review**: Quarterly  
**Next Review**: April 2025
