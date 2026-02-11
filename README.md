# 🦄 Pony Collection

🦄 Pony Collection é um projeto fullstack construído em NestJS, SQLite, com autenticação JWT e Angular. Para demonstrar processo de autenticação, guards de rota, operações CRUD, gerenciamento de favoritos, e integração de UI frontend baseado em layout Figma, desenvolvido passo a passo para a experiência de aprendizado.

O tema da aplicação é inspirado no universo de _My Little Pony_, tornando o aprendizado mais leve e engajador, sem perder o foco em práticas reais de desenvolvimento de software.

---

## 🎯 Objetivos do Projeto

Este projeto tem como objetivo ensinar os participantes a:

- Criar uma API REST utilizando **NestJS**
- Persistir dados utilizando **SQLite**
- Implementar autenticação e autorização com **JWT**
- Proteger rotas utilizando **Guards**
- Desenvolver endpoints com mentalidade de **BFF (Backend for Frontend)**
- Criar um frontend moderno com **Angular**
- Implementar fluxos de login e logout
- Gerenciar estado da aplicação
- Consumir APIs protegidas
- Construir telas baseadas em um layout do **Figma**

## 🧱 Visão Geral da Arquitetura

```text
Frontend (Angular)
   │
   │ HTTP + JWT
   │
   ▼
Backend (NestJS)
- Auth (JWT)
- Users
- Ponies
- Guards
   │
   ▼
Banco de Dados SQLite
```

O backend consiste em uma única aplicação NestJS, projetada com mentalidade de **Backend for Frontend (BFF)**, ou seja, os endpoints e respostas da API são pensados para atender diretamente às necessidades do frontend.

## 🧩 Funcionalidades

### 🔐 Autenticação

- Cadastro de usuário
- Login com JWT
- Rotas protegidas
- Fluxo de logout

### 🦄 Gerenciamento de Poneys

- Cadastro de personagens
- Listagem de todos os poneys
- Visualização de detalhes
- Atualização e remoção de personagens

### ⭐ Favoritos

- Favoritar e desfavoritar poneys
- Listagem de favoritos por usuário

### 🖥️ Frontend

- Tela de login
- Guards de rota
- Tela de listagem de personagens
- Sidesheet de detalhes
- Gerenciamento de favoritos
- Modal de cadastro/edição
- Logout do sistema

## 🛠️ Stack Tecnológica

### Backend

- Node.js
- NestJS
- SQLite
- TypeORM ou Prisma
- Autenticação JWT

### Frontend

- Angular (última versão)
- TypeScript
- Angular Router
- Gerenciamento de estado
- UI baseada em layout do Figma

## 📚 Estrutura do Curso

O projeto é construído ao longo de vários módulos:

1. Visão geral do projeto e arquitetura
1. Setup do backend com NestJS e SQLite
1. Modelagem de domínio (Users, Ponies)
1. Autenticação e autorização com JWT
1. Operações de CRUD
1. Desenvolvimento do frontend com Angular
1. Funcionalidade de favoritos
1. Gerenciamento de estado
1. Integração da UI com o Figma
1. Revisão final e melhorias

Cada módulo evolui a partir do anterior, simulando o ciclo real de desenvolvimento de um produto.

## 🚀 Como Começar (Visão Geral)

> As instruções detalhadas de setup serão apresentadas durante o curso.

Requisitos gerais:

- Node.js (LTS)
- npm ou yarn
- Git

## 📌 Observações

- Este repositório tem fins educacionais.
- O projeto prioriza clareza e aprendizado, não otimizações de nível produtivo.
- A arquitetura foi pensada para facilitar extensões futuras (ex: aplicativos mobile).

## 🦄 Sobre o Tema

O tema *My Little Pony* é utilizado apenas para fins educacionais e ilustrativos, tornando o curso mais divertido e acessível.