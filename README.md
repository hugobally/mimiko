# mimiko <img src="https://user-images.githubusercontent.com/41960941/157228980-3398632e-39da-4bad-a6da-cc14adfa4f41.svg" alt="logo" width="40" align="left" />
**mimiko uses graphs to help you map your music and discover new sounds**

https://user-images.githubusercontent.com/41960941/157226859-1a73c5a3-9367-49d7-a960-86c665c5d361.mp4

Using the Spotify recommendation API, you can start from a song you like and explore a graph of related songs. In short, it's a visualized playlist ! It is all persisted on the server, and you can explore other users' playlists.

> **_NOTE:_** This project is a prototype and a learning experience, dates back to 2020 and is not currently maintained. However, you can launch it locally by cloning the repo. Don't hesitate to reach out if you encounter any issue

## Stack & Post-Mortem/Takeaways

Frontend: Vue.js, D3.js + SVG
- Vue was a good framework to quickly learn and use, as a newcomer to frontend frameworks. The documentation is thorough and the single page components are good for quick iteration.
- D3.js is a complex library, but once you get the hang of it it is powerful. Laying out a graph using the force algorithm (i.e. generating a layout by simulating a physical force on the whole graph) is chaotic and a bit of a black box, and there's a lot of room for performance optimization.
- Performance is the main limit to this project becoming more than a prototype. As SVGs render as DOM nodes, having too many nodes on the graph slows the app down.    - Using a `canvas` and a rendering library would be the logical next step to fix this issue. The force-graph layout, although costly, can still be done by D3.js as it is agnostic to the rendering, and it could be optimized later on.

Backend: Go + Prisma ORM/Graphql API
- Coming from a C, working with Go on the backend felt familiar, and it was fun to build the server 'from the ground up'.
- Prisma is an easy to setup ORM and it was easy to plug the GraphQL API to it. Ultimately it is a bit overkill for the scale of this project, but it was a good learning opportunity.
- GraphQL is very different from REST and requires careful setup, but it's a joy to use on the frontend.
