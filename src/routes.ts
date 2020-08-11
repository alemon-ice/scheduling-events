import express from 'express';

const routes = express.Router();

routes.get('/', (req, res) => {
  return res.json('It works!');
});

export default routes;
