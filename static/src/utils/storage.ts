export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export class Storage {
  private readonly storageKey = 'tasks';

  public getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(this.storageKey);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  public saveTask(task: Task): void {
    try {
      const tasks = this.getTasks();
      tasks.push(task);
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save task');
    }
  }

  public updateTask(taskId: string, updates: Partial<Task>): void {
    try {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  public deleteTask(taskId: string): void {
    try {
      const tasks = this.getTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredTasks));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
}