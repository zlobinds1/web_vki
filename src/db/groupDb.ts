import { Group } from './entity/Group.entity';
import AppDataSource from './AppDataSource';
import type GroupInterface from '@/types/GroupInterface';

const groupRepository = AppDataSource.getRepository(Group);

/**
 * Получение групп
 * @returns  Promise<GroupInterface[]>
 */
export const getGroupsDb = async (): Promise<GroupInterface[]> => {
  return await groupRepository.find();
};

/**
 * Добавление группы
 * @returns  Promise<GroupInterface>
 */
export const addGroupsDb = async (groupFields: Omit<GroupInterface, 'id'>): Promise<GroupInterface> => {
  const group = new Group();
  const newGroup = await groupRepository.save({
    ...group,
    ...groupFields,
  });

  return newGroup;
};
