import { Request, Response } from 'express';
import knex from '../database/connection';
import { parseISO, startOfHour, format, isPast } from 'date-fns';

class EventsController {
  index = async (request: Request, response: Response) => {
    const events = await knex('rooms_events')
      .join('events', 'events.id', '=', 'rooms_events.id_event')
      .join('rooms', 'rooms.id', '=', 'rooms_events.id_room')
      .select('rooms.name AS room_name', 'rooms.building', 'events.*');

    const serializedItems = events.map(event => {
      return {
        id_event: event.id,
        building: event.building,
        room_name: event.room_name,
        event_name: event.name,
        description: event.description,
        date_time: format(event.date_time, "dd'/'MM'/'yyyy HH':'mm"),
        responsible: event.responsible,
      }
    });

    response.json(serializedItems);
  }

  create = async (request: Request, response: Response) => {
    const { name, description, date_time, responsible, rooms } = request.body;

    const trx = await knex.transaction();

    const parsedDateTime = parseISO(date_time);
    const eventDateTime = startOfHour(parsedDateTime);

    if (isPast(eventDateTime)) {
      await trx.rollback();
      return response.json('This date is before the actual date and hour.');
    }

    for (let i = 0; i < rooms.length; i++) {
      const findEventsInSameDate = await trx('rooms_events')
        .join('events', 'events.id', '=', 'rooms_events.id_event')
        .join('rooms', 'rooms.id', '=', 'rooms_events.id_room')
        .where('date_time', eventDateTime)
        .where('rooms_events.id_room', rooms[i])
        .select('*')
        .first();

      if (findEventsInSameDate) {
        await trx.rollback();
        return response.json('There is an event already booked in the same local for this date and time.');
      }
    }

    const event = {
      name,
      description,
      date_time: eventDateTime,
      responsible,
    };

    const eventCreated = await trx('events').insert(event);

    const id_event = eventCreated[0];

    const rooms_events = rooms.map((id_room: number) => {
      return {
        id_room,
        id_event,
      }
    });

    await trx('rooms_events').insert(rooms_events);

    await trx.commit();

    return response.json({ message: 'Event created with success.' });
  }

  update = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { name, description, date_time, responsible, rooms } = request.body;

    const trx = await knex.transaction();

    const idExists = await trx('events').where('id', id).first();

    if (!idExists) {
      await trx.rollback();
      return response.status(400).json({ error: 'Event not exists.' });
    }

    const parsedDateTime = parseISO(date_time);
    const eventDateTime = startOfHour(parsedDateTime);

    if (isPast(eventDateTime)) {
      await trx.rollback();
      return response.json('This date is before the actual date and hour.');
    }

    for (let i = 0; i < rooms.length; i++) {
      const findEventsInSameDate = await trx('rooms_events')
        .join('events', 'events.id', '=', 'rooms_events.id_event')
        .join('rooms', 'rooms.id', '=', 'rooms_events.id_room')
        .where('date_time', eventDateTime)
        .where('rooms_events.id_room', rooms[i])
        .whereNot('rooms_events.id_event', id)
        .select('*')
        .first();

      if (findEventsInSameDate) {
        await trx.rollback();
        return response.json('There is an event already booked in the same local for this date and time.');
      }
    }

    const eventExists = await trx('events')
      .where('date_time', date_time)
      .whereNot('id', id)
      .first()
      .select('*');

    if (eventExists) {
      await trx.rollback();
      return response.status(400).json({ error: 'Event already exists.' });
    }

    const new_rooms_events = rooms.map((id_room: number) => {
      return {
        id_room,
        id_event: Number(id),
      }
    });

    await trx('rooms_events').where('id_event', id).del();

    await trx('rooms_events').insert(new_rooms_events);

    const event = {
      name,
      description,
      date_time: eventDateTime,
      responsible,
    };

    await trx('events').where('id', id).update(event);

    await trx.commit();

    return response.json(`Event updated with success.`);
  }

  delete = async (request: Request, response: Response) => {
    const { id } = request.params;

    const trx = await knex.transaction();

    const verify = await trx('events').where('id', id).del();

    if (verify === 0) {
      await trx.rollback();
      return response.json({ message: 'Event does not exists.' });
    }

    await trx.commit();

    return response.json({ message: 'Event deleted with success.' });
  }
}

export default EventsController;
