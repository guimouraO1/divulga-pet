# Sospet - Aplicação Web para Encontrar Pets Perdidos

## Descrição

Sospet é uma aplicação web onde os usuários podem postar informações sobre seus animais de estimação perdidos ou encontrados. A plataforma permite que os usuários publiquem fotos dos animais, seus nomes, espécies (por exemplo, gato, cachorro), sexo, status (perdido ou encontrado), última localização e raça.

## Requisitos

### Requisitos Funcionais

- [x] **Criação de Conta de Usuário:** Novos usuários podem se cadastrar gratuitamente no site.
  
- [x] **Login na Conta:** Todos os usuários podem fazer login na aplicação se tiverem uma conta cadastrada.
  
- [x] **Autenticação de Usuário:** Os usuários devem poder se autenticar na aplicação utilizando JWT para permanecerem logados.
  
- [x] **Chat em Tempo Real:** A aplicação fornece um sistema de chat em tempo real, permitindo que os usuários troquem mensagens instantaneamente utilizando websockets em solicitações de resgate.
  
- [x] **Página de Postagem:** Os usuários podem postar informações sobre seus pets perdidos ou encontrados para solicitar ajuda.
  
- [x] **Página de Encontrar Pet:** Página que exibe todas as postagens utilizando paginação. Os usuários podem resgatar os pets entrando em contato com a outra parte através do chat.
  
- [ ] **Página de Perfil:** Os usuários devem poder modificar suas informações, como primeiro nome, último nome, endereço, foto de perfil, telefone e visualizar seus posts.
  
- [ ] **Notificações:** A aplicação deve fornecer notificações em tempo real para novas mensagens, solicitações de resgate e outras interações relevantes.
  
- [ ] **Mapa Interativo:** Página com mapa interativo exibindo a última localização conhecida do animal utilizando Leaflet.

### Requisitos Não Funcionais

- [ ] **Interface de Usuário Intuitiva:** A interface de usuário deve ser intuitiva e fácil de usar para garantir uma experiência agradável.
  
- [ ] **Desempenho:** A aplicação deve ser responsiva e ter baixa latência para garantir uma experiência de chat suave.
  
- [ ] **Escalabilidade:** A arquitetura da aplicação deve ser escalável para lidar com um grande número de usuários simultâneos.
  
- [ ] **Segurança:** Implementação de um mecanismo robusto de segurança para proteger os dados dos usuários e prevenir ataques.

## Tecnologias Utilizadas

- **AngularJS:** Framework JavaScript para construção da interface de usuário.
  
- **Socket.IO:** Biblioteca para comunicação em tempo real entre cliente e servidor.
  
- **JWT (JSON Web Token):** Mecanismo de autenticação seguro.
  
- **Node.js:** Plataforma para execução do servidor backend.
  
- **Express:** Framework para construção de aplicativos web com Node.js.
  
- **AWS S3:** Framework para conectar ao R2 da Cloudflare para salvar imagens das postagens utilizando URLs preassinadas.
  
- **Lazy Load:** A aplicação utiliza a tecnologia de lazy load para carregar páginas somente quando o usuário as abre, melhorando o desempenho da página. Também é utilizado o lazy load a nível de componentes.
  
- **Guards:** Utilização de guards para controlar o acesso às páginas que requerem autenticação de usuário.

## Autor

Este projeto foi desenvolvido por [Guilherme de Moura Oliveira](https://github.com/guimouraO1).

## Licença

Este projeto está licenciado sob a [Licença MIT](https://opensource.org/licenses/MIT).

## Contribuições

Contribuições para melhorar e expandir este projeto são bem-vindas. Sinta-se à vontade para abrir uma issue ou enviar um pull request no repositório do GitHub.