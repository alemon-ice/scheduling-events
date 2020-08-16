import express from 'express';
import { celebrate, Joi } from 'celebrate';

import RoomsController from './controllers/RoomsController';
import EventsController from './controllers/EventsController';

const routes = express.Router();

const roomsController = new RoomsController();
const eventsController = new EventsController();

routes.get('/rooms', roomsController.index);
routes.post('/rooms', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().max(50),
    building: Joi.string().required().max(50),
  }),
}, { abortEarly: false }),
  roomsController.create);
routes.put('/rooms/:id', roomsController.update);
routes.delete('/rooms/:id', roomsController.delete);

routes.get('/events', eventsController.index);
routes.get('/events_day', eventsController.eventsOfDay);
routes.post('/events', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().max(50),
    description: Joi.string().required().max(200),
    responsible: Joi.string().required().max(50),
  })
}),
  eventsController.create);
routes.put('/events/:id', eventsController.update);
routes.delete('/events/:id', eventsController.delete);

export default routes;
