import csv from 'csvtojson';
import fs from 'fs';
import path from 'path';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

/*
 * NEAT-CSV: https://flaviocopes.com/node-read-csv/
 */

class ImportTransactionsService {
  public async execute(fileName: string): Promise<Transaction[]> {
    const transactionsImported: Transaction[] = [];
    const fileNameComplete = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      fileName,
    );

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const imported = await csv().fromFile(fileNameComplete);
    if (!imported) {
      throw new AppError('File CSV load error!');
    }

    for await (const obj of imported) {
      let categoryFinded = await categoriesRepository.findOne({
        where: { title: obj.category },
      });

      if (!categoryFinded) {
        const categoryCreated = categoriesRepository.create({
          title: obj.category,
        });

        categoryFinded = await categoriesRepository.save(categoryCreated);
      }

      const { title } = obj;
      const value = Number(obj.value);
      const type = obj.type as 'income' | 'outcome';
      const category_id = categoryFinded?.id;

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id,
      });

      await transactionsRepository.save(transaction);
      transactionsImported.push(transaction);
    }

    await fs.promises.unlink(fileNameComplete);

    return transactionsImported;
  }
}

export default ImportTransactionsService;
