import { Component, OnInit } from '@angular/core';
import {LineChartModule, PieChartModule} from "@swimlane/ngx-charts";
import {NgIf} from "@angular/common";
import {SharedStateService} from "../../services/shared-state.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    PieChartModule,
    NgIf,
    LineChartModule,
    TranslatePipe
  ]
})
export class DashboardComponent implements OnInit {
  roleDistribution: any[] = [];
  usersLast7Days: any[] = [];
  colorScheme = 'cool';
  view: [number, number] = [700, 400];

  constructor(private sharedStateService: SharedStateService) {}

  ngOnInit(): void {
    this.subscribeToUserChanges(); // Подписываемся на изменения пользователей
    this.loadUsersLast7Days();
  }

  // Подписка на изменения пользователей
  private subscribeToUserChanges(): void {
    this.sharedStateService.users$.subscribe((users) => {
      this.roleDistribution = this.calculateRoleDistribution(users); // Обновляем распределение ролей
    });
  }


  // Пересчёт распределения ролей
  private calculateRoleDistribution(users: any[]): { name: string; value: unknown }[] {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role,
      value: count,
    }));
  }

  private loadUsersLast7Days(): void {
    this.usersLast7Days = [
      {
        name: 'Added Users',
        series: this.sharedStateService.getUsersAddedLast7Days(),
      },
    ];
  }
}
