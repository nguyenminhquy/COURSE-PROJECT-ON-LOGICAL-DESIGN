const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const serverUrl = process.env.SERVER_URL || 'http://localhost:3500';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Farm Backend API',
      version: '1.0.0',
      description: 'API documentation for Smart Farm backend using Express and Swagger',
    },
    servers: [
      {
        url: serverUrl,
        description: 'Firebase Emulator (Local)'

      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '\\swagger\\*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerOptions,
  swaggerSpec
};
