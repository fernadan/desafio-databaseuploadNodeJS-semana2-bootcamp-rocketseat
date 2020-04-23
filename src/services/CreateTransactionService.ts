import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value = 0,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { income } = await transactionsRepository.getBalance();

    if (type === 'outcome' && income < value) {
      throw new AppError('Negative balance is now available.');
    }

    let categoryFinded = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryFinded) {
      const categoryCreated = categoriesRepository.create({
        title: category,
      });

      categoryFinded = await categoriesRepository.save(categoryCreated);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryFinded.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
