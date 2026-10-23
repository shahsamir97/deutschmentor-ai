Your task is to work on the DeutschMentor AI repository, an AI-powered German translation dictionary and grammar learning platform. Follow the project architecture, technology stack, and coding standards described below when implementing or modifying code.

<Goals>

- Maintain clean, readable, scalable, and production-quality code.
- Minimize bugs, build failures, unnecessary dependencies, and unexpected behavior.
- Follow consistent software engineering practices across the frontend, backend, AI integrations, and infrastructure.

</Goals>

<HighLevelDetails>

- DeutschMentor AI provides multilingual translation, German spelling and grammar correction, example sentence generation, AI-powered grammar explanations, pronunciation, and saved translations.
- Frontend: React, TypeScript, Tailwind CSS.
- Backend: Python, FastAPI, Pydantic.
- AI Engineering: OpenAI API, LangChain, RAG, Embeddings.
- Database: PostgreSQL, pgvector, SQLAlchemy.
- Text-to-Speech: Google Cloud Text-to-Speech.
- DevOps: Docker, Kubernetes (K3s), Helm, GitHub Actions.
- Testing: Pytest, Vitest.
- The application follows a full-stack architecture with independently deployable frontend and backend services.

</HighLevelDetails>

<CodingStandards>

- Always write clean, readable, maintainable, and production-ready code.
- Follow SOLID, DRY, and separation of concerns where appropriate.
- Prefer simple implementations over unnecessary abstractions or overengineering.
- Use strict TypeScript typing and Python type hints.
- Write reusable components, modular functions, and meaningful variable names.
- Keep business logic separate from UI, API routing, and database operations.
- Implement proper error handling, input validation, and secure API communication.
- Never hardcode credentials, passwords, API keys, or sensitive information.
- Write unit tests for new features and bug fixes.
- Follow existing project conventions and avoid unrelated modifications.

</CodingStandards>

<DevelopmentGuidelines>

- Follow a feature-branch development workflow.
- Use Conventional Commits such as `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, and `chore:`.
- Ensure relevant tests, lint checks, and builds pass before creating pull requests.
- Maintain consistency between frontend TypeScript contracts and backend Pydantic schemas.
- Mock external AI services during unit testing to avoid unnecessary API costs.
- Avoid adding dependencies unless necessary.
- Prioritize security, performance, maintainability, and user experience.

</DevelopmentGuidelines>

<StepsToFollow>

- Review relevant existing code before implementing changes.
- Follow the established architecture and coding conventions.
- Implement changes incrementally with focused, maintainable code.
- Add or update relevant tests.
- Validate changes using available build, lint, and test commands.
- Document important architectural decisions or configuration changes.
- Do not assume unimplemented functionality already exists.

</StepsToFollow>