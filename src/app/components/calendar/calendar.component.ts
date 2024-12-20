import {Component} from '@angular/core';
import {CalendarDateFormatter, CalendarEvent, CalendarUtils, DateAdapter} from 'angular-calendar';
import {isSameDay} from 'date-fns';
import {CalendarModule} from 'angular-calendar';  // Импортируем только CalendarModule
@Component({
    selector: 'app-calendar',
    standalone: true,
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    imports: [
        CalendarModule,
    ],
  providers: [
    CalendarUtils,  // Добавляем CalendarUtils в провайдеры
  ]
})
export class CalendarComponent {
    viewDate: Date = new Date();
    events: CalendarEvent[] = [];

    constructor() {
        // Пример событий
        this.events = [
            {
                start: new Date(),
                title: 'Регистрация нового пользователя',
                color: {primary: '#1e90ff', secondary: '#D1E8FF'}
            },
            {
                start: new Date(),
                title: 'Изменение данных пользователя',
                color: {primary: '#ff0000', secondary: '#FFB3B3'}
            }
        ];
    }

    // Обработчик клика по дню
    dayClicked({day, sourceEvent}: { day: any; sourceEvent: MouseEvent | KeyboardEvent }): void {
        const date = day.date;
        const eventsForDay = this.events.filter(event => isSameDay(event.start, date));

        console.log('Выбран день: ', date);
        console.log('События на выбранный день: ', eventsForDay);
    }
}
