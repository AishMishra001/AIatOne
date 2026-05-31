import prisma from "../db";

export class TodoService {
  static async getAll() {
    return prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: number) {
    return prisma.todo.findUnique({
      where: { id },
    });
  }

  static async create(data: { title: string }) {
    return prisma.todo.create({
      data: {
        title: data.title,
      },
    });
  }

  static async update(id: number, data: { title?: string; completed?: boolean }) {
    return prisma.todo.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    return prisma.todo.delete({
      where: { id },
    });
  }
}
