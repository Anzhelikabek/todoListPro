import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { SocketService } from '../../services/socket.service';
import {NgForOf} from "@angular/common";

@Component({
    standalone: true,
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    imports: [
        ReactiveFormsModule,
        NgForOf
    ]
})
export class ChatComponent implements OnInit {
    form: FormGroup;
    messages: string[] = [];

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            message: [''], // Инициализация формы
        });
    }

    ngOnInit(): void {
        // Дополнительная логика
    }

    submit(): void {
        const message = this.form.get('message')?.value;
        if (message.trim()) {
            this.messages.push(message); // Добавляем сообщение в список
            this.form.reset(); // Сбрасываем форму
        }
    }
}
