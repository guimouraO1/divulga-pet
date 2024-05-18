# Divulga Pet - Aplicação Web para Encontrar Pets Perdidos

## Descrição

Divulga Pet é uma aplicação web projetada para ajudar a reunir animais de estimação perdidos com seus donos. A plataforma permite que os usuários publiquem informações sobre seus animais de estimação perdidos ou encontrados, incluindo fotos, nomes, espécies (por exemplo, gato, cachorro), sexo, status (perdido ou encontrado), última localização e raça.

## Funcionalidades

### Requisitos Funcionais

- **Criação de Conta de Usuário:** Novos usuários podem se cadastrar gratuitamente no site.
- **Autenticação de Usuário:** Autenticação utilizando JWT para que os usuários permaneçam logados de forma segura.
- **Chat em Tempo Real:** Sistema de chat em tempo real, permitindo que os usuários troquem mensagens instantaneamente utilizando websockets.
- **Página de Postagem:** Usuários podem postar informações sobre pets perdidos ou encontrados.
- **Página de Encontrar Pet:** Exibição de todas as postagens com paginação, permitindo contato via chat para resgate dos pets.
- **Página de Perfil:** Modificação de informações pessoais, como nome, endereço, foto de perfil, telefone e visualização de posts.
- **Notificações:** Notificações em tempo real para novas mensagens, solicitações de resgate e outras interações relevantes.
- **Mapa Interativo:** Exibição da última localização conhecida do animal em um mapa interativo utilizando Leaflet.

## Requisitos Não Funcionais

- **Interface de Usuário Intuitiva:** A interface de usuário é desenhada para ser intuitiva e fácil de usar.
- **Desempenho:** Aplicação responsiva com baixa latência, garantindo uma experiência de chat suave.
- **Escalabilidade:** Arquitetura escalável para lidar com um grande número de usuários simultâneos.
- **Segurança:** Implementação robusta de segurança para proteger dados dos usuários e prevenir ataques.

## Tecnologias Utilizadas

- **AngularJS:** Framework JavaScript para construção da interface de usuário.
- **Socket.IO:** Biblioteca para comunicação em tempo real entre cliente e servidor.
- **JWT (JSON Web Token):** Mecanismo de autenticação seguro.
- **Node.js:** Plataforma para execução do servidor backend.
- **Express:** Framework para construção de aplicativos web com Node.js.
- **AWS S3:** Integração com Cloudflare R2.
- **Lazy Load:** Carregamento de páginas e componentes somente quando necessário, melhorando o desempenho.
- **Guards:** Controle de acesso às páginas que requerem autenticação.
- **Presigned URLs:** Urls assinadas para salvar imagens no Bucket da Cloudflare R2.
- **Leaflet:** Biblioteca JS para criação de mapas interativos.

## Autores

Este projeto foi desenvolvido por [Guilherme de Moura Oliveira](https://github.com/guimouraO1).
Este projeto teve colaboção de grande parte do Design, UX e novas ideias de funcionalidades por [Karina Maia](https://github.com/KarinaMaia22)

## Licença

Este projeto está licenciado sob a [Licença MIT](https://opensource.org/licenses/MIT).

## Contribuições
Contribuições para melhorar e expandir este projeto são bem-vindas. Sinta-se à vontade para abrir uma issue ou enviar um pull request no repositório do GitHub.

---

