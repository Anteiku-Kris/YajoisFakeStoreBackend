import { Options } from "swagger-jsdoc"

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YajoisFakeStore API',
      version: '1.0.0',
      description: 'Documentación de la API para YajoisFakeStore (Proyecto Universitario)',
    },
    servers: [
      {
        url: 'http://localhost:3000'
      },
    ],
  },
  apis: ['src/routes/**/*.ts', 'src/controllers/**/*.ts'], 
};
