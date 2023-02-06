import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, Subject, switchMap } from 'rxjs';
import { NewTaskTime, Schedule } from '../interfaces';
import { TaskTime } from '../models/TaskTime';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

	private keyLocalStorage: string = 'schedule';
	private taskTimeChangedBehSubj: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private categoryTaskChangedBehSubj: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
		this.onInit();
	}

  private schedule: Schedule[] = [];

	private onInit(): void {
		if (window.localStorage.getItem(this.keyLocalStorage) === null) {
			this.schedule = [
				{
					path: 'mon',
					value: 'Понедельник',
					tasks: ['Сон', 'Гимнастика', 'Чтение', 'Прогулка'],
					time: [

					]
				},
				{
					path: 'tue',
					value: 'Вторник',
					tasks: ['Сон', 'Гимнастика', 'Чтение', 'Прогулка', 'Отдых'],
					time: []
				},
				{
					path: 'wed',
					value: 'Среда',
					tasks: ['Сон', 'Гимнастика', 'Чтение', 'Прогулка'],
					time: []
				},
				{
					path: 'thu',
					value: 'Четверг',
					tasks: ['Сон'],
					time: []
				},
				{
					path: 'fri',
					value: 'Пятница',
					tasks: ['Сон', 'Гимнастика', 'Чтение', 'Отдых'],
					time: []
				},
				{
					path: 'sat',
					value: 'Суббота',
					tasks: ['Сон', 'Гимнастика', 'Прогулка'],
					time: []
				},
				{
					path: 'sun',
					value: 'Воскресенье',
					tasks: ['Сон', 'Гимнастика'],
					time: []
				}
			];
			this.setScheduleInLocalStorage(this.schedule);

		} else {
			this.schedule = this.getScheduleInLocalStorage();
		}
	}

	private getScheduleInLocalStorage(): Schedule[] {
		const localStorageSchedule: string | null = window.localStorage.getItem(this.keyLocalStorage);

		if (localStorageSchedule === null) {
			return [];
		}
		return JSON.parse(localStorageSchedule);
	}

	private setScheduleInLocalStorage(schedule: Schedule[]): void {
		localStorage.setItem(this.keyLocalStorage, JSON.stringify(schedule));
	}

  public getSchedule(): Schedule[] {
    return this.schedule;
  }

  /**
    Эта функция возвращает массив категории задач на конкретный день
    @param {string} pathDay - день, формата: 'mon'
    @returns {string[]} - Массив категории задач на предоставленный день
  */
  public getCategoryTasksByDay(pathDay: string): string[] {
    const finded = this.schedule.find(item => item.path === pathDay);

    if (finded === undefined) {
      return [];
    } else {
      return finded.tasks;
    }
  }

	public getCategoryTasksByDay$(pathDay: string): Observable<string[]> {
		return this.taskTimeChangedBehSubj
		.pipe(
			switchMap(() => {
				return of(this.getCategoryTasksByDay(pathDay));
			})
		)
	}

  public сheckDayPath(pathDay: string): boolean {
    const finded = this.schedule.find(item => item.path === pathDay);

    // if (finded === undefined) {
    //   return false;
    // } else {
    //   return true;
    // }
    return finded === undefined ? false : true;
  }

	private getScheduleIndexByPathDay(pathDay: string): number | null {
		const finded = this.schedule.findIndex(item => item.path === pathDay);

		if (finded === -1) {
			return null;
		}
		return finded;
	}

	public addTaskTime(pathDay: string, newTaskTime: NewTaskTime): void {
		const scheduleIndexPathDay = this.getScheduleIndexByPathDay(pathDay);

		if (scheduleIndexPathDay === null) {
			return;
		}

		const taskTime = new TaskTime(newTaskTime);
		// здесь надо написать проверку на то, есть ли перекрывающая задача или что-то типа того
		this.schedule[scheduleIndexPathDay].time.push(taskTime);
		this.setScheduleInLocalStorage(this.schedule);
		this.taskTimeChangedBehSubj.next(true);
	}

	public getTasksTimeByPathDay(pathDay: string): TaskTime[] {
		const scheduleIndexPathDay = this.getScheduleIndexByPathDay(pathDay);

		if (scheduleIndexPathDay === null) {
			return [];
		}

		return this.schedule[scheduleIndexPathDay].time.slice().sort((a, b) => {
			const [aHours, aMinutes] = a.start.split(":");
			const [bHours, bMinutes] = b.start.split(":");

			if (aHours < bHours) return -1;
			if (aHours > bHours) return 1;
			if (aMinutes < bMinutes) return -1;
			if (aMinutes > bMinutes) return 1;

			return 0;
		});
	}

	public getTasksTimeByPathDay$(pathDay$: Observable<string>): Observable<TaskTime[]> {
		return this.taskTimeChangedBehSubj
		.pipe(
			switchMap(() => pathDay$),
			switchMap(pathDay => {
				return of(this.getTasksTimeByPathDay(pathDay));
			})
		)
	}

	public createCategoryTask(pathDay: string, categoryTask: string): void {
		const scheduleIndexPathDay = this.getScheduleIndexByPathDay(pathDay);

		if (scheduleIndexPathDay === null) {
			return;
		}

		this.schedule[scheduleIndexPathDay].tasks.push(categoryTask);
		this.categoryTaskChangedBehSubj.next(true);
	}
}
