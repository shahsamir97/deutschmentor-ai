# DeutschMentor AI 🇩🇪

**An AI-powered German translation dictionary and grammar learning platform.**

DeutschMentor AI helps users learn German through multilingual translation, intelligent spelling and grammar correction, everyday sentence generation, and AI-powered grammar explanations.

The goal is to make German learning more interactive, personalized, and accessible to learners of different proficiency levels.

## ✨ Features

- **Multilingual Translation:** Translate between German and other languages in both directions.
- **Smart Corrections:** Detect German spelling and grammar mistakes with clickable correction suggestions.
- **Sentence Generation:** Generate two simple, practical German sentences using the translated or entered word.
- **Grammar Explanations:** Explain sentence structure and grammar rules using Retrieval-Augmented Generation (RAG).
- **German Pronunciation:** Listen to German words and sentences using high-quality text-to-speech.
- **Saved Translations:** Registered users can save translations and generated example sentences.
- **Personalized Learning (Planned):** Identify recurring grammar mistakes and recommend targeted practice.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| AI Engineering | OpenAI API, LangChain, RAG, Embeddings |
| Database | PostgreSQL, pgvector, SQLAlchemy |
| Text-to-Speech | Google Cloud Text-to-Speech |
| DevOps | Docker, Kubernetes (K3s), Helm, GitHub Actions |
| Testing | Pytest, Vitest |

## 🏗️ Architecture

```text
                React + TypeScript
                        |
                    REST API
                        |
                 Python FastAPI
                        |
        +---------------+---------------+
        |               |               |
   OpenAI API      PostgreSQL      Google Cloud TTS
        |           + pgvector           |
   Translation       User Data       German Speech
   & Generation      & RAG Data
```

The frontend and backend are independently deployable. The production environment is designed for containerized deployment on Kubernetes with CI/CD automation.

## 📁 Project Structure

```text
deutschmentor-ai/
├── frontend/          # React + TypeScript application
├── backend/           # FastAPI application
├── infrastructure/    # Docker, Kubernetes and Helm
├── docs/              # Architecture and documentation
├── .github/workflows/ # CI/CD pipelines
└── README.md
```

## 🚀 Development & Deployment

The project follows a feature-branch development workflow with Conventional Commits, automated testing, code reviews, and GitHub Actions.

GitHub Copilot is used throughout development for implementation assistance, debugging, test generation, and code review.

**Deployment target:** A publicly accessible, HTTPS-enabled application hosted on Kubernetes.

**Project status:** 🚧 Under active development.

## 🎯 Project Goals

- Build a practical AI-powered German learning application.
- Implement production-oriented full-stack architecture.
- Demonstrate LLM integration, RAG, vector databases, and AI evaluation.
- Apply professional software engineering and DevOps practices.
- Deploy a functional application using Kubernetes and CI/CD.


