import { Request, Response } from 'express';
import knex from '../database/connection';

class RoomsController {
  index = async (request: Request, response: Response) => {
    const rooms = await knex('rooms')
      .select('rooms.*')
      .orderBy('building');

    return response.json(rooms);
  }

  selectRoom = async (request: Request, response: Response) => {
    const { id } = request.params;

    const rooms = await knex('rooms').where('id', id).first();

    if (!rooms) {
      return response.send('Id not exists.');
    }

    return response.json(rooms);
  }

  create = async (request: Request, response: Response) => {
    const { name, building } = request.body;

    const trx = await knex.transaction();

    const roomExists = await trx('rooms')
      .where('name', name)
      .andWhere('building', building)
      .first();

    if (roomExists) {
      await trx.rollback();
      return response.status(400).send('Room already exists.');
    }

    await trx('rooms').insert(request.body);

    await trx.commit();

    return response.send('Room created with success.');
  }

  update = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { name, building } = request.body;

    const trx = await knex.transaction();

    const idExists = await trx('rooms').where('id', id).first();

    if (!idExists) {
      await trx.rollback();
      return response.status(400).send('Room not exists.');
    }

    const roomExists = await trx('rooms')
      .where('name', name)
      .andWhere('building', building)
      .whereNot('id', id)
      .first()
      .select('*');

    if (roomExists) {
      await trx.rollback();
      return response.status(400).send('Room already exists.');
    }

    await trx('rooms').where('id', id).update({
      name,
      building,
    });

    await trx.commit();

    return response.send('Room updated with success.');
  }

  delete = async (request: Request, response: Response) => {
    const { id } = request.params;

    const deletedRoom = await knex('rooms').where('id', id).del();

    if (deletedRoom === 0) {
      return response.send('Room not exists.');
    }

    return response.send('Room deleted with success.');
  }
}

export default RoomsController;