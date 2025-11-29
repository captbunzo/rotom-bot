# Roadmap & TODO

This document outlines planned features, improvements, and development tasks for Rotom Bot.

## Current Priorities

### Database Migration

- [x] Create TypeORM entity files for all models
- [ ] Create TypeORM data source configuration
- [ ] Update repository layer to use TypeORM
- [ ] Create database migrations
- [ ] Update service layer
- [ ] Test all database operations

### Commands & Features

#### Commands Improvements

- [ ] Create a better version of `/boss list` output to show active raid bosses
- [ ] Improve command error handling and user feedback
- [ ] Add command usage statistics and analytics

#### Battle Management

- [ ] Enhanced battle scheduling with time zones
- [ ] Battle difficulty and strategy suggestions
- [ ] Post-battle statistics and reporting

#### Profile & Pokédex

- [ ] Advanced Pokédex filtering and search
- [ ] Achievement system for trainers
- [ ] Profile sharing and comparison features

### Administration & Configuration

#### Admin Features

- [ ] Configure an admin channel for bot status messages and errors
- [ ] Admin dashboard with bot statistics
- [ ] Automated health checks and monitoring
- [ ] Backup and restore functionality

#### Guild Management

- [ ] Add guild-level configuration system
- [ ] Support for tagging roles when creating battles
- [ ] Custom guild settings per server
- [ ] Guild analytics and usage reports

### Code Quality & Architecture

#### Development Practices

- [x] Switch to TypeScript (completed)
- [ ] Convert commands from data structures to proper classes
- [ ] Implement comprehensive error handling
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Code documentation and API docs

#### Performance & Scalability

- [ ] Database query optimization
- [ ] Caching strategy implementation
- [ ] Rate limiting and abuse prevention
- [ ] Horizontal scaling preparation

## Planned Features

### Internationalization

- [ ] Build proper usage of multiple languages
- [ ] Dynamic language switching per guild
- [ ] Community translation contributions
- [ ] Language-specific regional features

### Integration & APIs

- [ ] Pokémon GO API integration (if available)
- [ ] External raid coordination tools
- [ ] Web dashboard for trainers
- [ ] Mobile app companion

### Advanced Features

- [ ] Machine learning for raid recommendations
- [ ] Community events and tournaments
- [ ] Trading coordination system
- [ ] Weather-based notifications

## Bug Fixes & Technical Debt

### Known Issues

- [ ] Event handler instantiation pattern needs fixing
- [ ] Component loading error handling
- [ ] Memory leak prevention in long-running processes

### Technical Debt

- [ ] Remove legacy model files after TypeORM migration
- [ ] Refactor utility functions for better organization
- [ ] Standardize error response formats
- [ ] Update deprecated Discord.js patterns

## Community & Documentation

### Documentation

- [x] Create comprehensive docs structure
- [ ] API reference documentation
- [ ] User guides and tutorials
- [ ] Video tutorials for setup
- [ ] Community contribution guidelines

### Community Features

- [ ] User feedback system
- [ ] Feature request voting
- [ ] Community moderator tools
- [ ] Beta testing program

## Release Planning

### Version 2.0 (TypeORM Migration)

- [ ] Complete TypeORM migration
- [ ] Stable release with current features
- [ ] Migration guide for existing installations

### Version 2.1 (Guild Enhancements)

- [ ] Guild-level configuration
- [ ] Role tagging for battles
- [ ] Admin improvements

### Version 2.2 (Command Improvements)

- [ ] Enhanced boss listings
- [ ] Better battle management
- [ ] Profile improvements

### Version 3.0 (Major Features)

- [ ] Multi-language support
- [ ] Advanced battle features
- [ ] Web dashboard

## Contributing

See [Development Guide](./development.md) for information on:

- Setting up development environment
- Code standards and practices
- Contribution workflow
- Testing procedures

## Notes

- Priority items are marked with urgency levels
- Features may be moved between versions based on complexity
- Community feedback influences prioritization
- Breaking changes are planned for major versions only
