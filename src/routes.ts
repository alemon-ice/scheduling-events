import express from 'express';

import RoomsController from './controllers/RoomsController';

const routes = express.Router();

const roomsController = new RoomsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', roomsController.create);
routes.put('/rooms/:id', roomsController.update);
routes.delete('/rooms/:id', roomsController.delete);

export default routes;
