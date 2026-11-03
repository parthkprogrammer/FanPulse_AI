# FanPulse AI

> Cricket-only, AI-powered live sports and fantasy companion.

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/parthkprogrammer/FanPulse_AI)
[![Java Version](https://img.shields.io/badge/Java-21%20LTS-blue)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178C6)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.4-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-gray)](LICENSE)

---

## 1. Overview

Cricket fans routinely juggle 3 to 5 separate applications during match days: one for live scores, another for fantasy leagues, a third for player stats, and additional platforms for tactical commentary. This fragmented experience causes constant context-switching and information overload.

**FanPulse AI** unifies the cricket match experience into a single intelligent platform:
1. **Cricket Match Dashboard:** Live scorecards, overs, innings, and delivery feeds.
2. **Player Statistics:** Comprehensive batting, bowling, and fielding profiles.
3. **User-Created Fantasy Teams:** Custom 11-player lineup drafting across both competing squads.
4. **Deterministic Fantasy Scoring:** Backend-calculated scoring with Captain (2x) and Vice-Captain (1.5x) multipliers.
5. **Fantasy Team Comparison:** Side-by-side differential analysis and score variance tracking.
6. **AI-Powered Match Explanations:** Natural-language match situation narratives grounded strictly in verified match data.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React + TypeScript | 18.3 / 5.5 | Type-safe declarative Single Page Application (SPA). |
| **Tooling & Styling** | Vite + Tailwind CSS | 5.4 / 3.4 | ESM dev server, minified Rollup packaging, utility-first dark styling. |
| **Frontend State** | Redux Toolkit | 2.2 | Centralized state management for Auth, match cache, and fantasy drafts. |
| **Backend Framework** | Spring Boot | 3.3.5 | Enterprise modular monolith on Java 21 LTS with embedded Tomcat. |
| **Security** | Spring Security + JWT | 6.3.4 | Stateless Bearer token authentication and role-based access control. |
| **Persistence** | Spring Data JPA + Hibernate | 3.3 / 6.5 | Relational data access and transaction management (`@Transactional`). |
| **Database** | PostgreSQL | 16.4 | ACID relational storage with schema migrations via Flyway. |
| **AI Integration** | Spring WebClient (Direct LLM) | 6.1 | Grounded prompt-completion pipeline for match and player insights. |
| **Testing** | JUnit 5 + Mockito + Vitest | Modern | Automated unit, component, and Testcontainers integration testing. |
| **DevOps** | Docker + GitHub Actions | Modern | Multi-stage container builds and automated CI quality gates. |

---

## 3. Repository Structure

```
FanPulse_AI/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD automation pipelines
├── backend/                # Java 21 + Spring Boot 3.3.5 REST API service
├── database/               # PostgreSQL schema DDL and Flyway migration scripts
├── docs/                   # Architectural blueprints & engineering specifications
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS SPA
├── infrastructure/         # Docker Compose, Nginx, and deployment configs
├── .editorconfig           # IDE cross-platform formatting rules
├── .gitignore              # Multi-stack Git ignore rules
└── README.md               # Project overview and developer onboarding
```

---

## 4. Documentation Index

The platform architecture is fully specified across 10 engineering blueprints:

| Document | Focus & Content |
|---|---|
| [PROJECT_VISION.md](file:///U:/Fanpulse_AI/docs/PROJECT_VISION.md) | Problem statement, core pillars, target audience, MVP scope, and out-of-scope boundaries. |
| [COMPETITOR_ANALYSIS.md](file:///U:/Fanpulse_AI/docs/COMPETITOR_ANALYSIS.md) | Competitive analysis of Cricbuzz, ESPNcricinfo, Dream11, CricViz, and India's PROG Act 2025 regulatory context. |
| [REQUIREMENTS.md](file:///U:/Fanpulse_AI/docs/REQUIREMENTS.md) | 71 testable requirements (`FR-*`, `NFR-*`), 19 business rules (`BR-*`), and 10 use cases (`UC-*`). |
| [SYSTEM_ARCHITECTURE.md](file:///U:/Fanpulse_AI/docs/SYSTEM_ARCHITECTURE.md) | High-level architecture, module decomposition, sequence diagrams, security boundaries, and trade-offs. |
| [TECHNOLOGY_STACK.md](file:///U:/Fanpulse_AI/docs/TECHNOLOGY_STACK.md) | Official stable version matrix, deep technology evaluations, and RAG architectural evaluation. |
| [DATABASE_DESIGN.md](file:///U:/Fanpulse_AI/docs/DATABASE_DESIGN.md) | Normalized PostgreSQL 16 schema, 16 entities, constraints, indexes, and sample SQL queries. |
| [API_DESIGN.md](file:///U:/Fanpulse_AI/docs/API_DESIGN.md) | RESTful API specifications with request/response DTOs, validation rules, and HTTP error envelopes. |
| [FRONTEND_DESIGN.md](file:///U:/Fanpulse_AI/docs/FRONTEND_DESIGN.md) | Design system, Tailwind palette, component hierarchy, and complete specifications for all 12 frontend pages. |
| [AI_MODULE_DESIGN.md](file:///U:/Fanpulse_AI/docs/AI_MODULE_DESIGN.md) | AI service architecture, prompt engineering, structured match context, token budgets, and anti-hallucination guardrails. |
| [DEVELOPMENT_ROADMAP.md](file:///U:/Fanpulse_AI/docs/DEVELOPMENT_ROADMAP.md) | 15-milestone implementation plan, branch conventions, test requirements, and Definition of Done. |

---

## 5. Development Roadmap Summary

Implementation proceeds in 15 sequential milestones outlined in the [Roadmap](file:///U:/Fanpulse_AI/docs/DEVELOPMENT_ROADMAP.md):

* **M01–M04: Foundation:** Repo setup, Frontend & Backend scaffold, PostgreSQL & Flyway migrations.
* **M05–M07: Core Data:** JWT Authentication, Match Management, and Player Statistics.
* **M08–M10: Fantasy Engine:** 11-player lineup drafting, configuration-driven scoring, and team comparison.
* **M11–M12: AI & QA:** Grounded AI match assistant, comprehensive test coverage (JaCoCo >= 80%).
* **M13–M15: Operations:** Multi-stage Dockerization, GitHub Actions CI/CD, and MVP release tagging.

---

## 6. Prerequisites

To develop on FanPulse AI locally, ensure the following are installed:
* **Java Development Kit (JDK):** Version 21 LTS (e.g. Eclipse Temurin)
* **Node.js:** Version 20 LTS or 22 LTS
* **Apache Maven:** Version 3.9+ (or use included `mvnw`)
* **Docker & Docker Compose:** Docker Engine 26+ / Compose v2.27+
* **PostgreSQL:** Version 16+ (or via Docker container)

---

## 7. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

