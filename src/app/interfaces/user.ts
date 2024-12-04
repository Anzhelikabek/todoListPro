export interface User {
    id?: string; // Уникальный идентификатор
    code?: number; // Персональный код пользователя (может быть числом или строкой)
    firstName?: string; // Имя пользователя
    lastName?: string; // Фамилия пользователя
    age?: number; // Возраст пользователя
    email?: string; // Электронная почта
    phoneNumber?: string; // Номер телефона
    gender?: "male" | "female" | "other"; // Пол пользователя
    address?: string; // Адрес пользователя
    dateOfBirth?: string; // Дата рождения (в формате ISO: "YYYY-MM-DD")
    profilePicture?: string; // URL профиля изображения
    role?: "admin" | "user" | "moderator"; // Роль пользователя в системе
}
