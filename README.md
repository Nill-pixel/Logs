<h3 align="center">Sistema de Logs</h3>

---

<p align="center">Sistema para coleta, armazenamento e análise de logs com suporte para alertas em tempo real e envio de dados para outros servidores.</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name="about"></a>

O Sistema de Logs é uma solução robusta para a coleta, armazenamento e análise de logs provenientes de múltiplos serviços. Ele permite a configuração de diferentes níveis de severidade (info, warning, error) e facilita o monitoramento em tempo real dos eventos do sistema através de WebSockets. Além disso, o sistema pode enviar dados agregados e alertas para outros servidores utilizando Webhooks.

A arquitetura do projeto é dividida em dois repositórios principais:

1. **[movie-application-master](https://github.com/Nill-pixel/movie-application-master.git)**: Contém a implementação dos serviços que geram e enviam logs para o serviço central.
2. **[Logs](https://github.com/Nill-pixel/Logs.git)**: O repositório principal que coleta, armazena e analisa os logs, gerando insights e alertas em tempo real.

## 🏁 Getting Started <a name="getting_started"></a>

Estas instruções vão ajudá-lo a configurar o projeto em sua máquina local para desenvolvimento e testes.

### Prerequisites

Certifique-se de ter o Node.js e o npm instalados. Você pode baixar o Node.js [aqui](https://nodejs.org/).

### Installing

1. Clone o repositório de logs:

   ```bash
   git clone https://github.com/Nill-pixel/Logs.git
   cd Logs
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o banco de dados e outras variáveis de ambiente conforme necessário.

4. Inicie o servidor em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

### Configurando os Serviços de Envio de Logs

Clone o repositório do projeto que envia logs:

1. Clone o repositório:

   ```bash
   git clone https://github.com/Nill-pixel/movie-application-master.git
   cd movie-application-master
   ```

2. Configure o endpoint de API para enviar logs para o serviço central de logs conforme a documentação no repositório `Logs`.

## 🔧 Running the tests <a name="tests"></a>

Este projeto não inclui testes automatizados no momento. Certifique-se de testar manualmente as funcionalidades principais após a instalação.

## 🎈 Usage <a name="usage"></a>

Para usar o sistema de logs:

1. Configure os serviços (do repositório `movie-application-master`) para enviar logs para o serviço central (do repositório `Logs`).
2. Conecte-se ao WebSocket do serviço central para receber atualizações em tempo real.
3. Utilize a API do serviço central para consultar logs e estatísticas.
4. Receba alertas e insights via WebSockets e Webhooks.

## 🚀 Deployment <a name="deployment"></a>

Para implantar o sistema em um ambiente de produção:

1. Configure o banco de dados e outras variáveis de ambiente no servidor de produção.
2. Compile o projeto TypeScript:

   ```bash
   tsc
   ```

3. Inicie o servidor em modo de produção:

   ```bash
   npm start
   ```

## ⛏️ Built Using <a name = "built_using"></a>

- [Prisma](https://www.prisma.io/) - ORM para banco de dados
- [Express](https://expressjs.com/) - Framework de servidor
- [Socket.io](https://socket.io/) - Comunicação em tempo real via WebSockets
- [TypeScript](https://www.typescriptlang.org/) - Linguagem de programação

## ✍️ Authors <a name = "authors"></a>

- [Nilvany Sunguessungue](https://github.com/Nill-pixel) - Desenvolvimento e manutenção
