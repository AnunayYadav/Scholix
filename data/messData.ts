export type MealCategories = { [key: string]: string; };
export type MealPlan = { breakfast: MealCategories; lunch: MealCategories; snacks: MealCategories; dinner: MealCategories; };
export type DayMenu = { day: string; meals: MealPlan; };
export type WeeklyMenu = DayMenu[];

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MESS_DATA: { week1: WeeklyMenu; week2: WeeklyMenu } = {
    week1: [
        {
            day: 'Sunday', meals: {
                breakfast: { "North Indian": "Aloo Prantha, Packed Curd", "Continental": "Red Sauce Pasta", "South Indian": "Mysore Bonda", "Essentials": "White Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Kara Kuzhambu, Carrot Poriyal, Puliogare", "North Indian": "Yellow Dal Fry, Aloo Bhaji, Plain Rice", "Curd & Bread": "Plain Curd, Roti", "Accompaniment": "Pickled Salad" },
                snacks: { "Snack": "Kulcha, Nutri Gravy", "Beverage": "Tea, Coffee" },
                dinner: { "South Indian": "Mysore Sambhar, Bhindi Palya, Plain Rice", "North Indian": "Maah Chana Dal, Gatta Curry, Bhuna Onion Pulao", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Gulab Jamun" }
            }
        },
        {
            day: 'Monday', meals: {
                breakfast: { "North Indian": "Stuffed Mix Prantha, Pickle", "Continental": "Veg Stuffed Toast", "South Indian": "Idli with Sambhar, Coconut Chutney", "Healthy Option": "Mix Dal Sprouts", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee" },
                lunch: { "South Indian": "Chettinad Rasam, Cabbage Dum Fry, Lemon Rice", "North Indian": "Arhar Dal, Seasonal Veg, Jeera Rice, Veg Pulao", "Curd & Bread": "Boondi Raita, Roti", "Accompaniment": "Fryums" },
                snacks: { "Snack": "Besan Aloo Tikki, Tomato Ketchup", "Beverage": "Tea, Lemon Water" },
                dinner: { "South Indian": "Mudha Pappu, Gutti Vankaya, Soya Biryani", "North Indian": "Yellow Dal Fry, Paneer Butter Masala, Plain Rice", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Semiya Kheer" }
            }
        },
        {
            day: 'Tuesday', meals: {
                breakfast: { "North Indian": "Poori, Aloo Curry", "Continental": "Black Chana Masala", "South Indian": "Chow Chow Bhat (Sweet & Salty)", "Essentials": "White Bread, Jam, Butter, Banana", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Sambhar, Beetroot Kadala Thoran, Curd Rice", "North Indian": "Yellow Dal Fry, Mix Veg, Plain Rice, Veg Pulao", "Curd & Bread": "Mix-Veg Raita, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Vada Pav, Tomato Ketchup", "Beverage": "Tea, Jal Jeera" },
                dinner: { "South Indian": "Beerakaya Pappu, Carrot Poriyal, Plain Rice", "North Indian": "Sabut Masoor Dal, Mushroom Matar, Veg Dum Biryani", "Breads": "Roti", "Accompaniments": "Appalam", "Dessert": "Besan Burfi" }
            }
        },
        {
            day: 'Wednesday', meals: {
                breakfast: { "North Indian": "Kulcha (Toasted), Chana Gravy", "Continental": "Indori Poha", "South Indian": "Mix Veg Uthappam, Coconut Chutney", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Mysore Sambhar, Drumstick Tomato Curry, Curd Rice", "North Indian": "Rajma, Tinda Masala, Jeera Rice", "Curd & Bread": "Boondi Raita, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Bombay Sandwich, Tomato Ketchup", "Beverage": "Tea, Masala Chaas" },
                dinner: { "South Indian": "Parippu Sambhar, Potato Peas Poriyal, Tamarind Rice", "North Indian": "Arhar Dal, Ghia Kofta Curry, Plain Rice, Veg Pulao", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Rasgulla" }
            }
        },
        {
            day: 'Thursday', meals: {
                breakfast: { "North Indian": "Plain Prantha, Pickle", "Continental": "Vermicelli Upma", "South Indian": "Medu Vada with Sambhar, Peanut Chutney", "Essentials": "White Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Sorakkai Kootu, Yam Poriyal, Sambhar Rice", "North Indian": "Punjabi Kadhi Pakoda, Aloo Cabbage Matar, Plain Rice", "Curd & Bread": "Majjiga Pulusu, Roti", "Accompaniment": "Pickled Salad" },
                snacks: { "Snack": "Hakka Noodles, Tomato Ketchup", "Beverage": "Tea, Coffee" },
                dinner: { "South Indian": "Kandhi Pappu, Mini Matar Curry, Tomato Rice", "North Indian": "Split Maah Dal, Paneer Do Pyaza, Matar Pulao", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Ice Cream" }
            }
        },
        {
            day: 'Friday', meals: {
                breakfast: { "North Indian": "Stuffed Mooli Prantha, Packed Curd", "Continental": "Veg Stuffed Toast", "South Indian": "Ven Pongal, Coconut Chutney", "Healthy Option": "Moong Sprouts", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Mulangi Sambhar, Bagara Baingan, Curd Rice", "North Indian": "Black Channa, Mix Veg Kofta, Veg Pulao", "Curd & Bread": "Plain Curd, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Bread Pakoda, Tomato Ketchup", "Beverage": "Tea, Masala Chaas" },
                dinner: { "South Indian": "Senaga Pappu, Zucchini Kofta, Tomato Rice", "North Indian": "Ghia Chana Dal, Bhindi Masala, Plain Rice", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Coconut Laddu" }
            }
        },
        {
            day: 'Saturday', meals: {
                breakfast: { "North Indian": "Soya Paneer Prantha, Pickle", "Continental": "Indori Poha", "South Indian": "Vegetable Rawa Upma, Peanut Chutney", "Essentials": "White Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Paruppu Urundai Kulambu, Potato Podimas, Khuska", "North Indian": "Mushroom Matar, Aloo Gobhi Adarki, Plain Rice", "Curd & Bread": "Dahi Bhalla, Roti", "Accompaniment": "Green Salad, Imly Chutney" },
                snacks: { "Snack": "Samosa, Tomato Ketchup", "Beverage": "Tea, Cold Coffee" },
                dinner: { "South Indian": "Vengaya Sambhar (Onion), Arbi Vepudu, Soya & Matar Dum Biryani", "North Indian": "Maah Chana Dal, Soya Chaap Makhni, Veg Pulao", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Boondi Laddu" }
            }
        }
    ],
    week2: [
        {
            day: 'Sunday', meals: {
                breakfast: { "North Indian": "Stuffed Mix Prantha, Pickle", "Continental": "Bread Cutlet", "South Indian": "Hot Pongal, Tomato Gojju", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Garlic Pepper Rasam, Gutti Vankaya, Tomato Rice", "North Indian": "Pindi Chole, Aloo Chatpate, Plain Rice", "Curd & Bread": "Boondi Raita, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Veg Coleslaw S/W, Green Chutney", "Beverage": "Tea, Coffee" },
                dinner: { "South Indian": "Tomato Sambhar, Arbi Vepudu, Plain Rice", "North Indian": "Hari Moong Dal, Aloo Matar (Dry), Plain Rice", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Suji Halwa" }
            }
        },
        {
            day: 'Monday', meals: {
                breakfast: { "North Indian": "Stuffed Aloo Prantha, Packed Curd", "Continental": "Bread Cutlet", "South Indian": "Minapa Punugullu, Peanut Chutney", "Healthy Option": "Mix Dal Sprouts", "Essentials": "Brown Bread, Jam, Butter, Banana", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Tomato Dhal Kootu, Vegetable Sagu, Curd Rice", "North Indian": "Dal Makhni, Methi Malai Mattar, Plain Rice", "Curd & Bread": "Boondi Raita, Roti", "Accompaniment": "Fryums" },
                snacks: { "Snack": "Veg Bajji, Green Chutney", "Beverage": "Tea, Coffee" },
                dinner: { "South Indian": "Tomato Pappu, Arbi Poriyal, Plain Rice", "North Indian": "Yellow Moong Dal, Manchurian, Fried Rice", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Sweet Pongal" }
            }
        },
        {
            day: 'Tuesday', meals: {
                breakfast: { "North Indian": "Plain Prantha, Hing Jeera Aloo (Dry)", "Continental": "Bread Cutlet", "South Indian": "Masala Vegetable Idli, Coconut Chutney", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Drum Stick Sambhar, Carrot Koveta, Coconut Rice", "North Indian": "Lobia Dal, Mix Veg, Plain Rice", "Curd & Bread": "Mix-Veg Raita, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "French Fries, Tomato Ketchup", "Beverage": "Tea, Rooh Afza" },
                dinner: { "South Indian": "Beerakaya Pappu, Paneer Chettinad Curry, Chitranna Rice", "North Indian": "Maah Chana Dal, Matar Paneer, Plain Rice", "Breads": "Roti", "Accompaniments": "Appalam", "Dessert": "Gulab Jamun" }
            }
        },
        {
            day: 'Wednesday', meals: {
                breakfast: { "North Indian": "Poori, Aloo Chana Curry", "Continental": "Cold Sandwich", "South Indian": "Vegetable Rawa Upma, Tomato Chutney", "Essentials": "White Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Malabari Sambhar, Beans Dum Fry, Coconut Rice", "North Indian": "Hari Moong Dal, Mix Veg, Plain Rice", "Curd & Bread": "Boondi Raita, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Bhel Puri", "Beverage": "Tea, Coffee" },
                dinner: { "South Indian": "Guntur Spiced Rasam, Brinjal Poriyal, Puliyodhara", "North Indian": "Rajma Rasila, Ghia Bari, Plain Rice", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Rice Kheer" }
            }
        },
        {
            day: 'Thursday', meals: {
                breakfast: { "North Indian": "Missa Prantha, Pickle", "Continental": "Vegetable Macaroni", "South Indian": "Idli with Sambhar, Coconut Chutney", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Palakura Pappu, Cabbage Matar, Soya Biryani", "North Indian": "Yellow Dal Fry, Aloo Shimla Mirch, Plain Rice", "Curd & Bread": "Majjiga Pulusu, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Kulcha, Matar Gravy", "Beverage": "Tea, Tang" },
                dinner: { "South Indian": "Meal Maker Curry, Avial, Plain Rice", "North Indian": "Arhar Dal, Kadai Aloo Masala, Veg Pulao", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Boondi Laddu" }
            }
        },
        {
            day: 'Friday', meals: {
                breakfast: { "North Indian": "Stuffed Gobhi/Onion Prantha, Soya Paneer Bhurji", "Continental": "Indori Poha", "South Indian": "Vermicelli Upma", "Healthy Option": "Broken Wheat Upma", "Essentials": "White Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Tamarind Rasam, Dumstick Baigan Matar, Curd Rice", "North Indian": "Arhar Dal, Bhindi Do Piazo, Jeera Rice", "Curd & Bread": "Plain Curd, Roti", "Accompaniment": "Green Salad" },
                snacks: { "Snack": "Samosa, Imly Chutney", "Beverage": "Tea, Coffee" },
                dinner: { "South Indian": "Sambhar, Kerala Urulai Roast, Plain Rice", "North Indian": "Dal Makhni, Ghia Kofta Curry, Plain Rice", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Ice Cream" }
            }
        },
        {
            day: 'Saturday', meals: {
                breakfast: { "North Indian": "Plain Prantha, Packed Curd", "Continental": "Indori Poha", "South Indian": "Medu Vada with Sambhar, Peanut Chutney", "Essentials": "Brown Bread, Jam, Butter", "Beverage": "Masala Tea, Coffee, Plain Milk" },
                lunch: { "South Indian": "Sambhar, Veg Salna, Andhra Veg Biryani", "North Indian": "Rajma, Kadai Paneer, Jeera Rice", "Curd & Bread": "Dahi Bhalla, Roti", "Accompaniment": "Green Salad, Imly Chutney" },
                snacks: { "Snack": "Hakka Noodles, Tomato Ketchup", "Beverage": "Tea, Cold Coffee" },
                dinner: { "South Indian": "Kandhi Pappu, Beans Dum Fry, Plain Rice", "North Indian": "Ghia Chana Dal, Arbi Masala, Corn Coriander Pulao", "Breads": "Roti", "Accompaniments": "Green Salad", "Dessert": "Fruit Custard" }
            }
        }
    ]
};
