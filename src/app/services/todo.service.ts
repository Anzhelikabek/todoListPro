import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private localStorageKey = 'products';

  constructor() {
    // Инициализируем данные в localStorage, если их нет
    if (!localStorage.getItem(this.localStorageKey)) {
      const initialData = {
        data: [{
          "id": "1000",
          "code": "f230fh0g3",
          "name": "Организовать стол",
          "description": "Убрать и организовать рабочий стол.",
          "status": true
        },
          {
            "id": "1001",
            "code": "nvklal433",
            "name": "Купить продукты",
            "description": "Купить овощи, фрукты и молочные продукты.",
            "status": true
          },
          {
            "id": "1002",
            "code": "zz21cz3c1",
            "name": "Закончить отчет",
            "description": "Подготовить финансовый отчет за месяц.",
            "status": false
          },
          {
            "id": "1003",
            "code": "244wgerg2",
            "name": "Позвонить механику",
            "description": "Записаться на обслуживание автомобиля.",
            "status": true
          },
          {
            "id": "1004",
            "code": "h456wer53",
            "name": "Подготовить презентацию",
            "description": "Сделать слайды для маркетинговой встречи.",
            "status": true
          },
          {
            "id": "1005",
            "code": "av2231fwg",
            "name": "Продлить страховку",
            "description": "Обновить полисы на авто и здоровье.",
            "status": false
          },
          {
            "id": "1006",
            "code": "bib36pfvm",
            "name": "Починить кран",
            "description": "Вызвать сантехника для ремонта крана в ванной.",
            "status": false
          },
          {
            "id": "1007",
            "code": "mbvjkgip5",
            "name": "Сдать задание",
            "description": "Отправить проектное задание до дедлайна.",
            "status": true
          },
          {
            "id": "1008",
            "code": "vbb124btr",
            "name": "Организовать фотографии",
            "description": "Отсортировать и сделать резервные копии цифровых фотографий.",
            "status": false
          },
          {
            "id": "1009",
            "code": "cm230f032",
            "name": "Выгулять собаку",
            "description": "Прогулять собаку в парке.",
            "status": true
          },
          {
            "id": "1010",
            "code": "plb34234v",
            "name": "Оплатить счета",
            "description": "Оплатить счета за электричество, воду и интернет.",
            "status": true
          },
          {
            "id": "1011",
            "code": "4920nnc2d",
            "name": "Прочитать книгу",
            "description": "Закончить чтение книги 'Атомные привычки'.",
            "status": true
          },
          {
            "id": "1012",
            "code": "250vm23cc",
            "name": "Посадить семена",
            "description": "Посадить базилик и томаты в саду.",
            "status": true
          },
          {
            "id": "1013",
            "code": "fldsmn31b",
            "name": "Написать блог",
            "description": "Подготовить статью о продуктивности.",
            "status": false
          },
          {
            "id": "1014",
            "code": "waas1x2as",
            "name": "Спланировать отпуск",
            "description": "Организовать поездку в горы с семьей.",
            "status": true
          },
          {
            "id": "1015",
            "code": "vb34btbg5",
            "name": "Обновить резюме",
            "description": "Добавить последние достижения в резюме.",
            "status": false
          },
          {
            "id": "1016",
            "code": "k8l6j58jl",
            "name": "Медитировать",
            "description": "Практиковать медитацию 15 минут ежедневно.",
            "status": true
          },
          {
            "id": "1017",
            "code": "v435nn85n",
            "name": "Убрать в гараже",
            "description": "Разобрать и организовать вещи в гараже.",
            "status": false
          },
          {
            "id": "1018",
            "code": "09zx9c0zc",
            "name": "Приготовить еду на неделю",
            "description": "Подготовить обеды на неделю вперед.",
            "status": true
          },
          {
            "id": "1019",
            "code": "mnb5mb2m5",
            "name": "Волонтерская работа",
            "description": "Записаться на мероприятие для волонтеров.",
            "status": true
          },
          {
            "id": "1020",
            "code": "r23fwf2w3",
            "name": "Купить подарок",
            "description": "Выбрать подарок на день рождения друга.",
            "status": false
          },
          {
            "id": "1021",
            "code": "pxpzczo23",
            "name": "Сделать уборку",
            "description": "Протереть пыль, пропылесосить и помыть полы.",
            "status": true
          },
          {
            "id": "1022",
            "code": "2c42cb5cb",
            "name": "Заказать продукты онлайн",
            "description": "Составить список и заказать продукты.",
            "status": true
          },
          {
            "id": "1023",
            "code": "5k43kkk23",
            "name": "Подготовить ужин",
            "description": "Приготовить ужин для гостей.",
            "status": false
          },
          {
            "id": "1024",
            "code": "lm2tny2k4",
            "name": "Выбрать мебель",
            "description": "Посетить мебельный магазин для выбора стола.",
            "status": true
          },
          {
            "id": "1025",
            "code": "nbm5mv45n",
            "name": "Записаться к врачу",
            "description": "Назначить консультацию у терапевта.",
            "status": true
          },
          {
            "id": "1026",
            "code": "zx23zc42c",
            "name": "Постирать одежду",
            "description": "Запустить стиральную машину с накопившейся одеждой.",
            "status": false
          },
          {
            "id": "1027",
            "code": "acvx872gc",
            "name": "Сделать завтрак",
            "description": "Приготовить блинчики на завтрак.",
            "status": true
          },
          {
            "id": "1028",
            "code": "tx125ck42",
            "name": "Устроить пикник",
            "description": "Организовать пикник с друзьями.",
            "status": true
          },
          {
            "id": "1029",
            "code": "gwuby345v",
            "name": "Сходить в кино",
            "description": "Посетить премьеру нового фильма.",
            "status": true
          }]
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(initialData.data));
    }
  }

  // Получение всех продуктов
  getProducts(): any[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  // Добавление нового продукта
  addProduct(product: any): void {
    const products = this.getProducts();
    products.push(product);
    localStorage.setItem(this.localStorageKey, JSON.stringify(products));
  }

  // Обновление существующего продукта
  updateProduct(productId: string, updatedProduct: any): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      products[index] = updatedProduct;
      localStorage.setItem(this.localStorageKey, JSON.stringify(products));
    }
  }

  // Удаление продукта
  deleteProduct(productId: string): void {
    const products = this.getProducts();
    const updatedProducts = products.filter((p) => p.id !== productId);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedProducts));
  }
}
