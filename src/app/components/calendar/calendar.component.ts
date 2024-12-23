import {Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";

@Component({
    selector: 'app-calendar',
    standalone: true,
    templateUrl: './calendar.component.html',
    imports: [
        NgIf,
        DatePipe,
        FormsModule,
        NgForOf,
        ButtonDirective,
        Ripple
    ],
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
    events: Array<{
        title: string,
        description: string,
        date: string,
        startTime: string,
        endTime: string,
        repeat: string,
        alert: string
    }> = [];
    newEventTitle: string = '';
    newEventStartTime: string = '';
    newEventEndTime: string = '';
    newEventDescription: string = '';

    editingEvent: any = null; // Событие для редактирования
    isEditModalOpen: boolean = false; // Флаг для отображения модального окна

    selectedDay: Date | null = null;  // Дата выбранного дня
    selectedMonth: Date = new Date(); // Текущий месяц
    selectedDaysWithEvents: Set<number> = new Set();  // Хранение дней с событиями

    daysInMonth: number[] = [];
    isModalOpen: boolean = false; // Флаг для отображения модального окна

    ngOnInit(): void {
        this.loadEvents(); // Загружаем события при инициализации
        this.updateDaysInMonth(); // Обновляем дни в текущем месяце
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.newEventTitle = ''; // Очистить поля формы
        this.newEventStartTime = '';
        this.newEventDescription = '';
        this.newEventEndTime = '';
    }

    // Загрузка событий из localStorage
    loadEvents() {
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) {
            this.events = JSON.parse(storedEvents);
            this.updateSelectedDaysWithEvents();  // Обновляем дни, которые имеют события
        }
    }

    // Обновление списка дней в текущем месяце
    updateDaysInMonth() {
        const year = this.selectedMonth.getFullYear();
        const month = this.selectedMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        this.daysInMonth = Array.from({length: daysInMonth}, (_, i) => i + 1); // Создаем массив дней месяца
    }


    // Переключение между месяцами
    changeMonth(increment: number) {
        const currentMonth = this.selectedMonth.getMonth();
        const newMonth = new Date(this.selectedMonth); // Создаем новый объект Date
        newMonth.setMonth(currentMonth + increment); // Обновляем месяц
        this.selectedMonth = newMonth; // Присваиваем новый объект
        this.updateDaysInMonth(); // Обновляем дни месяца
    }

    // Выбор дня
    selectDay(day: number) {
        this.selectedDay = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), day);
        this.openModal();
    }

    // Сохранение нового события
    saveEvent() {
        if (this.selectedDay) {

            if (this.selectedDay) {
                // Получаем полную дату (включая месяц и год)
                const fullDate = new Date(this.selectedDay); // selectedDay уже содержит месяц и год
                fullDate.setHours(0, 0, 0, 0); // Убираем время для точности

                // Создаем новое событие с полной датой
                const newEvent = {
                    title: this.newEventTitle,
                    description: this.newEventDescription,
                    date: fullDate.toISOString(), // Сохраняем полную дату в формате ISO
                    startTime: this.newEventStartTime,
                    endTime: this.newEventEndTime,
                    repeat: 'Never',
                    alert: 'None'
                };

                // Добавляем новое событие в массив
                this.events.push(newEvent);
                // Помечаем день как содержащий событие
                this.selectedDaysWithEvents.add(this.selectedDay.getDate());

                // Сохраняем данные в localStorage
                this.closeModal()
                this.updateLocalStorage();
                // Очистка формы
                this.newEventTitle = '';
                this.newEventStartTime = '';
                this.newEventEndTime = '';
                this.selectedDay = null; // Сброс выбора дня
            }
        }
    }

    // Сохранение отредактированного события
    saveEditedEvent() {
        if (this.editingEvent) {
            // Находим индекс редактируемого события и обновляем его
            const index = this.events.findIndex(e => e.date === this.editingEvent.date && e.title === this.editingEvent.title);
            if (index !== -1) {
                this.events[index] = {...this.editingEvent}; // Обновляем событие
                this.updateLocalStorage(); // Сохраняем данные в localStorage
                this.closeEditModal(); // Закрываем модальное окно
            }
        }
    }

    // Открытие модального окна для редактирования события
    openEditModal(event: any) {
        this.editingEvent = {...event}; // Копируем данные для редактирования
        this.isEditModalOpen = true; // Открываем модальное окно
    }

    // Закрытие модального окна
    closeEditModal() {
        this.isEditModalOpen = false;
        this.editingEvent = null; // Очищаем редактируемое событие
    }

    // Удаление события
    deleteEvent(event: any) {
        this.events = this.events.filter(e => e !== event); // Удаляем событие
        this.updateLocalStorage(); // Обновляем данные в localStorage
    }

    // Обновление данных в localStorage
    updateLocalStorage() {
        localStorage.setItem('events', JSON.stringify(this.events)); // Сохраняем события в localStorage
    }

    updateSelectedDaysWithEvents() {
        this.selectedDaysWithEvents.clear();
        this.events.forEach(event => {
            const day = new Date(event.date).getDate();
            this.selectedDaysWithEvents.add(day);
        });
    }

// Метод для проверки, выбран ли день
// Метод для проверки, выбран ли день
    isSelectedDay(day: number): boolean {
        if (!this.selectedDay) return false;
        return this.selectedDay.getDate() === day &&
            this.selectedDay.getMonth() === new Date().getMonth() &&
            this.selectedDay.getFullYear() === new Date().getFullYear();
    }

// Метод для проверки, есть ли событие в выбранный день
    isEventDay(day: number): boolean {
        return this.events.some(event => {
            const eventDate = new Date(event.date); // Преобразуем строку в объект Date
            return eventDate.getDate() === day &&
                eventDate.getMonth() === this.selectedMonth.getMonth() &&
                eventDate.getFullYear() === this.selectedMonth.getFullYear();
        });
    }


}
