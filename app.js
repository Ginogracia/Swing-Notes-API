const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//Routes importing
const signupRouter = require('./routes/signup')
const loginRouter = require('./routes/login')
const notesRouter = require('./routes/notes')


dotenv.config();

const app = express()
const PORT = process.env.PORT || 3000; 

app.use(express.json())

//Swagger Config
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My Notes API',
        version: '1.0.0',
        description: 'Self-hosted Swagger documentation',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              userId: { type: 'string' },
              dateAdded: { type: 'string', format: 'date-time' },
              notes: {
                type: 'array',
                items: { $ref: '#/components/schemas/Note' },
              },
            },
          },
          Note: {
            type: 'object',
            properties: {
              noteId: { type: 'string' },
              title: { type: 'string' },
              text: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              modifiedAt: { type: 'string', format: 'date-time' },
            },
          },
          LoginResponse: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              token: { type: 'string' },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          MessageOnly: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
      servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./routes/*.js'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  

//Routes

app.use('/user/signup', signupRouter)
app.use('/user/login', loginRouter)
app.use('/notes', notesRouter)



//Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to database. ☑️'))
    .catch(err => console.error('Error connecting to the database: ', err))



//Start the server
app.listen(PORT, () => {
    console.log(`Connected to the server (port: ${PORT}). ☑️`)
    console.log('http://localhost:3000/')
})
