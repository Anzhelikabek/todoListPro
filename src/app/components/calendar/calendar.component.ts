import {Component, OnInit} from "@angular/core";
import {
    CommonModule,
    DatePipe,
    NgClass,
    NgForOf,
    NgIf,
} from "@angular/common";
import {FormsModule, NgForm} from "@angular/forms";
import {Button, ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {TooltipModule} from "primeng/tooltip";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {MessageService} from "primeng/api";
import {DialogModule} from "primeng/dialog";
import {ToastModule} from "primeng/toast";
import {v4 as uuidv4} from 'uuid';

@Component({
    standalone: true,
    selector: "app-calendar",
    templateUrl: "./calendar.component.html",
    imports: [
        CalendarModule,
        NgIf,
        DatePipe,
        FormsModule,
        NgForOf,
        ButtonDirective,
        Ripple,
        Button,
        TooltipModule,
        NgClass,
        TranslatePipe,
        InputTextModule,
        ButtonModule,
        CommonModule,
        DialogModule,
        ToastModule,
    ],
    styleUrls: ["./calendar.component.scss"]
})
export class CalendarComponent implements OnInit {
    events: Array<{
        id: string | Uint8Array;
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
    }> = [];
    newEventTitle: string = "";
    newEventStartTime: string = '00:00';  // Значение по умолчанию
    newEventEndTime: string = '00:00';
    newEventDescription: string = "";

    editingStartTime: boolean = false;  // Флаг для отслеживания изменений
    editingEndTime: boolean = false;

    editingEvent: any = null;
    isEditModalOpen: boolean = false; // Флаг для отображения модального окна
    selectedDay: Date | null = null; // Дата выбранного дня
    selectedMonth: Date = new Date(); // Текущий месяц
    selectedDaysWithEvents: Set<number> = new Set(); // Хранение дней с событиями

    daysInMonth: number[] = []; // Массив дней месяца
    isModalOpen: boolean = false; // Флаг для отображения модального окна
    selectedDayEvents: any[] = [];
    weekDays: string[] = [];
    selectedStartHour: string = "";
    selectedStartMinute: string = "";
    selectedEndHour: string = "";
    selectedEndMinute: string = "";

    isDeleteConfirmOpen: boolean = false; // Флаг для открытия модального окна
    eventToDelete: any = null; // Событие, которое нужно удалить

    hours: string[] = [];
    minutes: string[] = [];

    constructor(public translate: TranslateService, private messageService: MessageService) {
    }

    getMonthAndYear(date: Date): string {
        if (!date) {
            return "";
        }
        const month = date.toLocaleString(this.translate.currentLang, {
            month: "long",
        });
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
        const year = date.getFullYear();
        return `${capitalizedMonth} ${year}`;
    }

    ngOnInit(): void {
        this.loadEvents(); // Загружаем события при инициализации
        this.updateDaysInMonth(); // Обновляем дни в текущем месяце
        this.setToday(); // Показываем события для сегодняшнего дня

        this.loadWeekDays(); // Загружаем дни недели при инициализации
        this.loadTimeOptions(); // Инициализация опций времени
        // Подписка на изменение языка
        this.translate.onLangChange.subscribe(() => {
            this.loadWeekDays(); // Перезагружаем дни недели при смене языка
        });
    }

    loadTimeOptions() {
        // Загружаем часы от 1 до 24
        this.hours = Array.from({length: 24}, (_, i) =>
            i < 10 ? "0" + i : "" + i,
        );

        // Загружаем минуты от 00 до 59
        this.minutes = Array.from({length: 60}, (_, i) =>
            i < 10 ? "0" + i : "" + i,
        );
    }

    loadWeekDays() {
        this.translate
            .get([
                "weekDays.Mon",
                "weekDays.Tue",
                "weekDays.Wed",
                "weekDays.Thu",
                "weekDays.Fri",
                "weekDays.Sat",
                "weekDays.Sun",
            ])
            .subscribe((translations) => {
                this.weekDays = [
                    translations["weekDays.Sun"],
                    translations["weekDays.Mon"],
                    translations["weekDays.Tue"],
                    translations["weekDays.Wed"],
                    translations["weekDays.Thu"],
                    translations["weekDays.Fri"],
                    translations["weekDays.Sat"],
                ];
            });
    }

    getFormattedDate(date: Date | null): string {
        if (!date) {
            return ""; // Возвращаем пустую строку или можно вернуть строку по умолчанию, если date null
        }

        return date.toLocaleString(this.translate.currentLang, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    setToday() {
        const today = new Date();
        this.selectedDay = today; // Устанавливаем текущую дату
        this.selectedDayEvents = this.events.filter(
            (event) => new Date(event.date).toDateString() === today.toDateString(),
        ); // Загружаем события для сегодняшнего дня
    }

    openAddEventModal() {
        this.isModalOpen = true;
        this.newEventStartTime = "00:00";
        this.newEventEndTime = "00:00";
    }

    closeModal() {
        // Закрытие модального окна
        this.isModalOpen = false;

        // Очистка данных
        this.newEventTitle = "";
        this.newEventDescription = "";
        this.newEventStartTime = "00:00";  // Возвращаем значение по умолчанию
        this.newEventEndTime = "00:00";    // Возвращаем значение по умолчанию
        this.selectedDay = null; // Сброс выбора дня

        // Сброс значений для времени
        this.selectedStartHour = "";
        this.selectedStartMinute = "";
        this.selectedEndHour = "";
        this.selectedEndMinute = "";

        // Сброс флагов, если вы используете их для отслеживания изменений
        this.editingStartTime = false;
        this.editingEndTime = false;

    }


    // Загрузка событий из localStorage
    loadEvents() {
        const storedEvents = localStorage.getItem("events");
        if (storedEvents) {
            this.events = JSON.parse(storedEvents);
            this.updateSelectedDaysWithEvents(); // Обновляем дни, которые имеют события
        }
    }

    // Обновление списка дней в текущем месяце
    updateDaysInMonth() {
        const daysInMonth = [];
        const firstDayOfMonth = new Date(
            this.selectedMonth.getFullYear(),
            this.selectedMonth.getMonth(),
            1,
        );
        const lastDayOfMonth = new Date(
            this.selectedMonth.getFullYear(),
            this.selectedMonth.getMonth() + 1,
            0,
        );
        const totalDays = lastDayOfMonth.getDate();

        for (let day = 1; day <= totalDays; day++) {
            daysInMonth.push(day);
        }
        this.daysInMonth = daysInMonth;
    }

    // Переключение между месяцами
    changeMonth(increment: number) {
        const currentMonth = this.selectedMonth.getMonth();
        const newMonth = new Date(this.selectedMonth); // Создаем новый объект Date
        newMonth.setMonth(currentMonth + increment); // Обновляем месяц
        this.selectedMonth = newMonth; // Присваиваем новый объект

        // Сбрасываем выбранный день при изменении месяца
        this.selectedDay = null; // Сбрасываем выбранный день
        this.selectedDayEvents = []; // Очищаем события для выбранного дня

        this.updateDaysInMonth(); // Обновляем дни месяца
    }

    // Выбор дня
    selectDay(day: number) {
        this.selectedDay = new Date(
            this.selectedMonth.getFullYear(),
            this.selectedMonth.getMonth(),
            day,
        );
        this.selectedDayEvents = this.events.filter(
            (event) =>
                new Date(event.date).toDateString() ===
                this.selectedDay?.toDateString(),
        );
    }

    // Сохранение нового события
    saveEvent(eventForm: NgForm) {
        if (eventForm.valid && this.selectedDay && this.newEventStartTime !== "00:00" && this.newEventEndTime !== "00:00") {
            const fullDate = new Date(this.selectedDay);
            fullDate.setHours(0, 0, 0, 0); // Убираем время для точности

            // Создаем новое событие с уникальным UUID
            const newEvent = {
                id: uuidv4(), // Генерируем уникальный UUID
                title: this.newEventTitle,
                description: this.newEventDescription,
                date: fullDate.toISOString(),
                startTime: this.newEventStartTime,
                endTime: this.newEventEndTime,
            };

            // Добавляем новое событие в массив
            this.events = [...this.events, newEvent];

            // Закрытие модального окна
            this.closeModal();

            // Обновление событий для выбранного дня
            this.selectedDayEvents = this.events.filter(
                (event) => new Date(event.date).toDateString() === this.selectedDay?.toDateString()
            );

            // Очистка формы
            this.newEventTitle = "";
            this.newEventStartTime = "";
            this.newEventEndTime = "";
            this.selectedDay = null; // Сброс выбора дня

            // Сохранение событий в localStorage
            this.updateLocalStorage();

            // Отображаем сообщение об успехе
            this.translate.get(['success', 'eventAdded']).subscribe(translations => {
                this.messageService.add({
                    severity: 'success',
                    summary: translations['success'],
                    detail: translations['eventAdded'],
                    life: 3000
                });
            });
        } else {
            // Сообщение об ошибке, если форма невалидна
            this.translate.get(['error', 'formInvalid']).subscribe(translations => {
                this.messageService.add({
                    severity: 'error',
                    summary: translations['error'],
                    detail: translations['formInvalid'],
                    life: 3000
                });
            });
        }
    }


    onStartTimeChange() {
        this.editingStartTime = true;
    }

    onEndTimeChange() {
        this.editingEndTime = true;
    }


    saveEditedEvent() {
        if (this.editingEvent) {
            // Находим индекс редактируемого события и обновляем его
            const index = this.events.findIndex(
                (e) =>
                    e.id === this.editingEvent.id
            );
            console.log(index)
            if (index !== -1) {
                // Обновляем событие
                this.events[index] = {...this.editingEvent}; // Используем spread оператор, чтобы обновить массив

                // Принудительно обновляем представление
                this.events = [...this.events]; // Обновляем массив, чтобы Angular заметил изменение

                // Сохраняем обновленные события в localStorage
                this.updateLocalStorage();

                // Закрытие модального окна
                this.closeEditModal();

                // Обновляем события для текущего дня
                this.selectedDayEvents = this.events.filter(
                    (event) =>
                        new Date(event.date).toDateString() ===
                        this.selectedDay?.toDateString(),
                );
                this.translate.get(['success', 'eventUpdated']).subscribe(translations => {
                    this.messageService.add({
                        severity: 'success',
                        summary: translations['success'],
                        detail: translations['eventUpdated'],
                        life: 3000
                    });
                });
            }
        } else {
            this.translate.get(['error', 'eventNotFound']).subscribe(translations => {
                this.messageService.add({
                    severity: 'error',
                    summary: translations['error'],
                    detail: translations['eventNotFound'],
                    life: 3000
                });
            });
        }
    }


    openEditModal(event: any) {
        this.editingEvent = {...event}; // Копируем данные для редактирования
        this.isEditModalOpen = true; // Открываем модальное окно
    }

    closeEditModal() {
        this.isEditModalOpen = false;
        this.editingEvent = null; // Очищаем редактируемое событие
    }

    deleteEvent(event: any) {
        this.openDeleteConfirmModal(event); // Открываем модальное окно подтверждения удаления
    }

    openDeleteConfirmModal(event: any) {
        this.isDeleteConfirmOpen = true;
        this.eventToDelete = event; // Сохраняем событие, которое нужно удалить
    }

    closeDeleteConfirmModal() {
        this.isDeleteConfirmOpen = false;
        this.eventToDelete = null; // Сбрасываем выбранное событие
    }

    deleteEventConfirmed() {
        try {
            if (this.eventToDelete) {
                // Удаляем событие из списка
                this.events = this.events.filter((e) => e !== this.eventToDelete);

                // Обновляем localStorage
                this.updateLocalStorage();

                // Отображаем сообщение об успехе
                this.translate.get(['success', 'eventDeleted']).subscribe(translations => {
                    this.messageService.add({
                        severity: 'success',
                        summary: translations['success'],
                        detail: translations['eventDeleted'],
                        life: 3000
                    });
                });

                // Обновляем события для выбранного дня
                this.selectedDayEvents = this.events.filter(
                    (e) => new Date(e.date).toDateString() === this.selectedDay?.toDateString(),
                );
            }

            // Закрываем модальное окно после подтверждения
            this.isDeleteConfirmOpen = false;
            this.closeDeleteConfirmModal();
        } catch (error) {
            // Если произошла ошибка, отображаем сообщение об ошибке
            this.translate.get(['error', 'eventDeleteFailed']).subscribe(translations => {
                this.messageService.add({
                    severity: 'error',
                    summary: translations['error'],
                    detail: translations['eventDeleteFailed'],
                    life: 3000
                });
            });

            // Закрываем модальное окно в случае ошибки
            this.isDeleteConfirmOpen = false;
            this.closeDeleteConfirmModal();
        }
    }

    updateLocalStorage() {
        localStorage.setItem("events", JSON.stringify(this.events)); // Сохраняем события в localStorage
    }

    updateSelectedDaysWithEvents() {
        this.selectedDaysWithEvents.clear();
        this.events.forEach((event) => {
            const day = new Date(event.date).getDate();
            this.selectedDaysWithEvents.add(day);
        });
    }

    isSelectedDay(day: number) {
        return this.selectedDay && this.selectedDay.getDate() === day;
    }

    // Проверка, является ли день текущим
    isCurrentDay(day: number): boolean {
        const today = new Date();
        return (
            today.getDate() === day &&
            this.selectedMonth.getMonth() === today.getMonth() &&
            this.selectedMonth.getFullYear() === today.getFullYear()
        );
    }

    // Проверка, есть ли событие для дня
    isEventDay(day: number): boolean {
        const date = new Date(
            this.selectedMonth.getFullYear(),
            this.selectedMonth.getMonth(),
            day,
        );
        return this.events.some(
            (event) => new Date(event.date).toDateString() === date.toDateString(),
        );
    }
}
