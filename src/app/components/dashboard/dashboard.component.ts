import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {LineChartModule, PieChartModule} from "@swimlane/ngx-charts";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    PieChartModule,
    NgIf,
    LineChartModule
  ]
})
export class DashboardComponent implements OnInit {
  roleDistribution: any[] = [];
  usersLast7Days: any[] = [];
  colorScheme = 'cool';
  view: [number, number] = [700, 400];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.subscribeToUserChanges(); // Подписываемся на изменения пользователей
    this.loadUsersLast7Days();
  }

  // Подписка на изменения пользователей
  private subscribeToUserChanges(): void {
    this.userService.users$.subscribe((users) => {
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
        series: this.userService.getUsersAddedLast7Days(),
      },
    ];
  }
}
