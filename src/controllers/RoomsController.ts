import { Request, Response } from 'express';
import knex from '../database/connection';

class RoomsController {
  index = async (request: Request, response: Response) => {
    const rooms = await knex('rooms').select('rooms.*');

    return response.json(rooms);
  }

  create = async (request: Request, response: Response) => {
    const { name, building } = request.body;

    const trx = await knex.transaction();

    const roomExists = await trx('rooms').where('name', name).andWhere('building', building).first();

    if (roomExists) {
      await trx.rollback();
      return response.status(400).json({ error: 'Room already exists.' });
    }

    await trx('rooms').insert(request.body);

    await trx.commit();

    return response.json(`Room created with success.`);
  }

  update = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { name, building } = request.body;

    const trx = await knex.transaction();

    const idExists = await trx('rooms').where('id', id).first();

    if (!idExists) {
      await trx.rollback();
      return response.status(400).json({ error: 'Room not exists.' });
    }

    const roomExists = await trx('rooms')
      .where('name', name)
      .andWhere('building', building)
      .whereNot('id', id)
      .first()
      .select('*');

    if (roomExists) {
      await trx.rollback();
      return response.status(400).json({ error: 'Room already exists.' });
    }

    await trx('rooms').where('id', id).update({
      name,
      building,
    });

    await trx.commit();

    return response.json(`Room updated with success.`);
  }

  delete = async (request: Request, response: Response) => {
    const { id } = request.params;

    const deletedRoom = await knex('rooms').where('id', id).del();
    console.log(deletedRoom);

    if (deletedRoom === 0) {
      return response.json('Room not exists.');
    }

    return response.json('Room deleted with success.');
  }
}

export default RoomsController;