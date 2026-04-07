/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */

function calculateSimpleRevenue(purchase, _product) {    
   // @TODO: Расчет выручки от операции
   
    const { discount, sale_price, quantity } = purchase;

    // Переводим скидку из процентов в десятичное число
    const discountDecimal = discount / 100;

    // Полная стоимость без скидки
    const fullPrice = sale_price * quantity;

    // Сумма после учета скидки
    const revenue = fullPrice * (1 - discountDecimal);

    return revenue;
}

  
/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге function calculateBonusByProfit(seller, index, total) {
                                        
    if (index === 0) {
        // Первый — 15%
        return 0.15 * seller.profit;
    } else if (index === 1 || index === 2) {
        // Второй или третий — 10%
        return 0.10 * seller.profit;
    } else if (index === total - 1) {
        // Последний — 0%
        return 0;
    } else {
        // Остальные — 5%
        return 0.05 * seller.profit;
    }
}


/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    //try {
        if (!data                                        ||
            !Array.isArray(data.customers)               ||
            !Array.isArray(data.products)                ||
            !Array.isArray(data.sellers)                 ||
            !Array.isArray(data.purchase_records)        ||
            data.sellers.length === 0                    ||
            data.products.length === 0                   ||
            data.purchase_records.length === 0           
           ) {throw new Error('Некорректные входные данные');}
     
        console.log('Данные в порядке:', data);
          
    // @TODO: Проверка наличия опций
        if (!options                                       ||
            typeof options !== 'object'                    ||
            typeof options.calculateRevenue !== 'function' ||
            typeof options.calculateBonus !== 'function'
        ) {
            throw new Error('Некорректные опции: обязательно должны быть calculateRevenue и calculateBonus как функции');
        }

    
    // @TODO: Подготовка промежуточных данных для сбора статистики
        const sellerStats = data.sellers.map(seller => ({
            seller_id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            top_products: [], 
            bonus: 0,
            products_sold: {},
        }));
      

    // @TODO: Индексация продавцов и товаров для быстрого доступа
        const sellerIndex = sellerStats.reduce((acc, seller) => {
            acc[seller.seller_id] = seller;
            return acc;
        }, {});

        const productIndex = data.products.reduce((acc, product) => {
            acc[product.sku] = product;
            return acc;
            }, {});

    // @TODO: Расчет выручки и прибыли для каждого продавца
        data.purchase_records.forEach(record => {                                 // Чек 
            const seller = sellerIndex[record.seller_id];                         // Продавец
            seller.sales_count = (seller.sales_count || 0) + 1;
            // Увеличить общую сумму выручки всех продаж
            seller.revenue = (seller.revenue || 0) + record.total_amount;


            // Расчёт прибыли для каждого товара
            record.items.forEach(item => {
                const product = productIndex[item.sku];                            // Товар
                // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
                // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
                // Посчитать прибыль: выручка минус себестоимость
                let cost = product.purchase_price * item.quantity;                 // Себестоимость
                let revenue = calculateSimpleRevenue(item, product);               // Выручка 
                let itemProfit = revenue - cost;                                   // Прибыль
            // Увеличить общую накопленную прибыль (profit) у продавца  
            seller.profit = (seller.profit || 0) + itemProfit;

                // Учёт количества проданных товаров
                if (!seller.products_sold[item.sku]) {
                   seller.products_sold[item.sku] = 0;
                }
                // По артикулу товара увеличить его проданное количество у продавца
                seller.products_sold[item.sku] += item.quantity;
            });
        });

    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования

    
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonusByProfit(index, sellerStats.length, seller);
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });


    // @TODO: Подготовка итоговой коллекции с нужными полями

    return sellerStats.map(seller => ({
        seller_id: seller.seller_id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));

  
        } 
        
        /*catch (e) {
            console.error('Ошибка:', e.message);
        }
}*/
