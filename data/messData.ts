export type MealCategories = { [key: string]: string; };
export type MealPlan = { breakfast: MealCategories; lunch: MealCategories; snacks: MealCategories; dinner: MealCategories; };
export type DayMenu = { day: string; meals: MealPlan; };
export type WeeklyMenu = DayMenu[];

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MESS_DATA: { week1: WeeklyMenu; week2: WeeklyMenu } = {
    week1: [
        {
            day: 'Sunday', meals: {
                breakfast: { "North Indian": "Aloo Prantha (250 Kcal), Pickle (15 Kcal)", "Continental": "Cold Sandwich (200 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Mysore Bonda (130 Kcal), Peanut Chutney (27 Kcal)", "Essentials": "White Bread (130 Kcal), Jam (15 Kcal), One Sachet Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Kara Kuzhambu (140 Kcal), Carrot Poriyal (35 Kcal), Puliogare (180 Kcal)", "North Indian": "Pindi Chola (150 Kcal), Khatta Meetha Petha (210 Kcal), Plain Rice (130 Kcal)", "Curd & Bread": "Onion Raita (60 Kcal), Roti (110 Kcal)", "Accompaniment": "Pickled Salad (15 Kcal)" },
                snacks: { "Snack": "Kulcha (180 Kcal), Nutri Gravy (115 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Mysore Sambhar (90 Kcal), Seasonal Vegetable (110 Kcal), Plain Rice (130 Kcal)", "North Indian": "Moong Chilka Dal (105 Kcal), Gatta Curry (140 Kcal), Bhuna Onion Pulao (160 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Fryums (120 Kcal), Green Salad (40 Kcal)", "Dessert": "Gulab Jamun (150 Kcal)" }
            }
        },
        {
            day: 'Monday', meals: {
                breakfast: { "North Indian": "Stuffed Mix Prantha (280 Kcal), Packed Curd (60 Kcal)", "Continental": "Red Sauce Pasta (110 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Idli with Sambhar (220 Kcal), Coconut Chutney (27 Kcal)", "Healthy Option": "Mix Dal Sprouts (95 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal)" },
                lunch: { "South Indian": "Chettinad Rasam (35 Kcal), Cabbage 65 (180 Kcal), Plain Rice (130 Kcal)", "North Indian": "Dal MiliJuli (110 Kcal), Seasonal Vegetable, Veg Pulao (130 Kcal)", "Curd & Bread": "Boondi Raita (130 Kcal), Roti (110 Kcal)", "Accompaniment": "Fryums (125 Kcal)" },
                snacks: { "Snack": "Besan Aloo Tikki (180 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Mudha Pappu (115 Kcal), Gutti Vankaya (130 Kcal), Soya Biryani (140 Kcal)", "North Indian": "Yellow Dal Fry (120 Kcal), Palak Paneer / Kadai Paneer (180 Kcal), Plain Rice (130 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Semiya Kheer (150 Kcal)" }
            }
        },
        {
            day: 'Tuesday', meals: {
                breakfast: { "North Indian": "Poori (90 Kcal), Aloo Curry (110 Kcal)", "Continental": "Black Chana Masala (110 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Rava Kesari (180 Kcal)", "Essentials": "White Bread (130 Kcal), Jam (15 Kcal), Butter (70 Kcal), Banana (95 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Sambhar (135 Kcal), Beetroot Kadala Thoran (120 Kcal), Lemon Rice (180 Kcal)", "North Indian": "Rajma (140 Kcal), Mix Veg (70 Kcal), Plain Rice (130 Kcal)", "Curd & Bread": "Mix-Veg Raita (130 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal)" },
                snacks: { "Snack": "Vada Pav (280 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Beerakaya Pappu (95 Kcal), Chikkudukaya Curry (85 Kcal), Plain Rice (130 Kcal)", "North Indian": "Sabut Masoor Dal (150 Kcal), Honey Chilly Potato (220 Kcal), Veg Dum Biryani (180 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Appalam (1pc) (35 Kcal)", "Dessert": "Suji Halwa (250 Kcal)" }
            }
        },
        {
            day: 'Wednesday', meals: {
                breakfast: { "North Indian": "Kulcha (Toasted) (260 Kcal), Chana Gravy (160 Kcal)", "Continental": "Veg Stuffed Toast (180 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Mix Veg Uthappam (180 Kcal), Coconut Chutney (12 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Mysore Sambhar (80 Kcal), Seasonal Vegetable, Plain Rice (150 Kcal)", "North Indian": "Yellow Dal Fry (120 Kcal), Seasonal Vegetable, Jeera Onion Pulao (150 Kcal)", "Curd & Bread": "Lauki Mint Raita (55 Kcal), Roti (110 Kcal)", "Accompaniment": "Fryums (120 Kcal)" },
                snacks: { "Snack": "Bombay Sandwich (350 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Parippu Sambhar (90 Kcal), Potato Peas Poriyal (110 Kcal), Tamarind Rice (165 Kcal)", "North Indian": "Maah Ki Dal (120 Kcal), Manchurian (200 Kcal), Plain Rice (130 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Fryums (120 Kcal)", "Dessert": "Rasgulla (120 Kcal)" }
            }
        },
        {
            day: 'Thursday', meals: {
                breakfast: { "North Indian": "Plain Prantha (200 Kcal), Aloo Bhujia (165 Kcal)", "Continental": "Vegetable Macaroni (140 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Medu Vada with Sambhar (150 Kcal), Peanut Chutney (27 Kcal)", "Essentials": "White Bread (130 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Sorakkai Kootu (75 Kcal), Tomato Rasam (35 Kcal), Plain Rice (130 Kcal)", "North Indian": "Punjabi Kadhi Pakoda (130 Kcal), Aloo Cabbage Matar (90 Kcal), Jeera Rice (130 Kcal)", "Curd & Bread": "Majjiga Pulusu (55 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal)" },
                snacks: { "Snack": "Hakka Noodles (250 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Kandhi Pappu (120 Kcal), Seasonal Vegetable, Plain Rice (130 Kcal)", "North Indian": "Dal Palak (100 Kcal), Paneer Do Pyaza (160 Kcal), Matar Pulao (140 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Gajar ka Halwa (260 Kcal) / Ice Cream (110 Kcal)" }
            }
        },
        {
            day: 'Friday', meals: {
                breakfast: { "North Indian": "Stuffed Mooli Prantha (200 Kcal), Packed Curd (60 Kcal)", "Continental": "Aloo Bonda (140 Kcal), Tomato Chutney (12 Kcal)", "South Indian": "Vegetable Rawa Upma (179 Kcal)", "Healthy Option": "Moong Sprouts (9 Kcal)", "Essentials": "White Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Mulangi Sambhar (70 Kcal), Bagara Baingan (140 Kcal), Plain Rice (130 Kcal)", "North Indian": "Black Channa (160 Kcal), Nutri Chilly (150 Kcal), Veg Pulao (130 Kcal)", "Curd & Bread": "Beetroot Raita (70 Kcal), Roti (110 Kcal)", "Accompaniment": "Pickled Salad (40 Kcal)" },
                snacks: { "Snack": "Bread Pakoda (220 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Senaga Pappu (150 Kcal), Mix Veg Poriyal (95 Kcal), Tomato Rice (130 Kcal)", "North Indian": "Ghia Chana Dal (110 Kcal), Tawa Veg (110 Kcal), Plain Rice (130 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Balushahi (150 Kcal) / Coconut Laddu (130 Kcal)" }
            }
        },
        {
            day: 'Saturday', meals: {
                breakfast: { "North Indian": "Soya Paneer Prantha (225 Kcal), Pickle (15 Kcal)", "Continental": "Indori Poha (150 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Minapa Punugullu (280 Kcal), Peanut Chutney (27 Kcal)", "Essentials": "White Bread (130 Kcal), Jam (15 Kcal), Butter (70 Kcal), Seasonal Fruit", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Paruppu Urundai Kulambu (220 Kcal), Potato Podimas (105 Kcal), Tomato Rice (130 Kcal)", "North Indian": "Matar Paneer (150 Kcal), Seasonal Vegetable, Plain Rice (130 Kcal)", "Curd & Bread": "Dahi Bhalla (130 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal) + Imly Chutney (12 Kcal)" },
                snacks: { "Snack": "Samosa (250 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Vengaya Sambhar (Onion) (110 Kcal), Artikay Vepudu (120 Kcal), Soya & Matar Dum Biryani (180 Kcal)", "North Indian": "Rajma (110 Kcal), Soya Chaap Makhni (170 Kcal), Plain Rice (130 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Moong Dal Halwa (250 Kcal)" }
            }
        }
    ],
    week2: [
        {
            day: 'Sunday', meals: {
                breakfast: { "North Indian": "Stuffed Mix Prantha (280 Kcal), Pickle (15 Kcal)", "Continental": "Mangalore Bajji (100 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Hot Pongal (130 Kcal), Tomato Gojju (90 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Garlic Pepper Rasam (20 Kcal), Gutti Vankaya (120 Kcal), Plain Rice (130 Kcal)", "North Indian": "Pindi Chole (150 Kcal), Aloo Chatpate (140 Kcal), Jeera Rice (150 Kcal)", "Curd & Bread": "Boondi Raita (130 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal)" },
                snacks: { "Snack": "Veg Coleslaw S/W (220 Kcal), Green Chutney (3 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Tomato Sambhar (65 Kcal), Seasonal Vegetable, Plain Rice (130 Kcal)", "North Indian": "Hari Moong Dal (105 Kcal), Mushroom Matar (95 Kcal), Veg Pulao (150 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Fryums (120 Kcal)", "Dessert": "Besan Burfi (420 Kcal)" }
            }
        },
        {
            day: 'Monday', meals: {
                breakfast: { "North Indian": "Stuffed Aloo Prantha (210 Kcal), Packed Curd (60 Kcal)", "Continental": "Bread Cutlet (220 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Vermicelli Upma (150 Kcal), Minapa Punugullu (280 Kcal), Peanut Chutney (27 Kcal)", "Healthy Option": "Mix Dal Sprouts (95 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal), Banana (95 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Tomato Dhal Kootu (90 Kcal), Vegetable Sagu (110 Kcal), Curd Rice (110 Kcal)", "North Indian": "Dal Makhni (170 Kcal), Methi Malai Mattar (160 Kcal), Plain Rice (130 Kcal)", "Curd & Bread": "Boondi Raita (130 Kcal), Roti (110 Kcal)", "Accompaniment": "Fryums (125 Kcal)" },
                snacks: { "Snack": "Veg Bajji (280 Kcal), Green Chutney (3 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Tomato Pappu (110 Kcal), Aloo Gadda Vepudu (150 Kcal), Plain Rice (130 Kcal)", "North Indian": "Yellow Moong Dal (105 Kcal), Seasonal Vegetable, Jeera Rice (150 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Sweet Pongal (210 Kcal)" }
            }
        },
        {
            day: 'Tuesday', meals: {
                breakfast: { "North Indian": "Plain Prantha (200 Kcal), Hing Jeera Aloo (Dry) (150 Kcal)", "Continental": "Bread Cutlet (220 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Masala Vegetable Idli (140 Kcal), Coconut Chutney (12 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Drum Stick Sambhar (90 Kcal), Chikkudukaya Curry (70 Kcal), Coconut Rice (180 Kcal)", "North Indian": "Lobia Dal (116 Kcal), Mix Veg (80 Kcal), Plain Rice (130 Kcal)", "Curd & Bread": "Cucumber/Ghiya Raita (60 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal)" },
                snacks: { "Snack": "French Fries (310 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Beerakaya Pappu (95 Kcal), Paneer Chettinad Curry (180 Kcal), Chitranna Rice (150 Kcal)", "North Indian": "Maah Chana Dal (120 Kcal), Paneer Butter Masala (180 Kcal), Plain Rice (130 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Appalam (1Pc) (35 Kcal)", "Dessert": "Gulab Jamun (150 Kcal)" }
            }
        },
        {
            day: 'Wednesday', meals: {
                breakfast: { "North Indian": "Poori (90 Kcal), Aloo Chana Curry (110 Kcal)", "Continental": "Cold Sandwich (200 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Vegetable Rawa Upma (179 Kcal), Tomato Chutney (12 Kcal)", "Essentials": "White Bread (130 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Malabari Sambhar (100 Kcal), Seasonal Vegetable, Pudina Rice (155 Kcal)", "North Indian": "Hari Moong Dal (105 Kcal), Seasonal Vegetable, Plain Rice (130 Kcal)", "Curd & Bread": "Mix-Veg Raita (70 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal)" },
                snacks: { "Snack": "Pav (225 Kcal), Bhaji (110 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Guntur Spiced Rasam (20 Kcal), Brinjal Poriyal (90 Kcal), Puliyodhara (160 Kcal)", "North Indian": "Rajma Rasila (130 Kcal), Manchurian (200 Kcal), Fried Rice (180 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Payasam (150 Kcal)" }
            }
        },
        {
            day: 'Thursday', meals: {
                breakfast: { "North Indian": "Missa Prantha (220 Kcal), Pickle (15 Kcal)", "Continental": "Vegetable Macaroni (150 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Idli with Sambhar (220 Kcal), Coconut Chutney (12 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Palakura Pappu (100 Kcal), Vankaya Poriyal (130 Kcal), Soya Biryani (140 Kcal)", "North Indian": "Punjabi Kadhi Pakoda (120 Kcal), Seasonal Vegetable, Plain Rice (130 Kcal)", "Curd & Bread": "Boondi Raita (130 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal)" },
                snacks: { "Snack": "Kachouri (320 Kcal), Aloo Sabji (110 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Meal Maker Curry (135 Kcal), Avial (90 Kcal), Plain Rice (130 Kcal)", "North Indian": "White Chana (360 Kcal), Potato Wedges (110 Kcal), Veg Pulao (180 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Boondi Laddu (150 Kcal)" }
            }
        },
        {
            day: 'Friday', meals: {
                breakfast: { "North Indian": "Stuffed Gobhi/Onion Prantha (250 Kcal), Packed Curd (60 Kcal)", "Continental": "Aloo Bonda (250 Kcal), Coconut Chutney (12 Kcal)", "South Indian": "Vermicelli Upma (150 Kcal)", "Healthy Option": "Broken Wheat Upma (180 Kcal)", "Essentials": "White Bread (130 Kcal), Jam (15 Kcal), Butter (70 Kcal)", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Tamarind Rasam (1 Kcal), Vankaya Poriyal (130 Kcal), Plain Rice (130 Kcal)", "North Indian": "Dal Palak (100 Kcal), Achari Soya Chaap Masala (150 Kcal), Jeera Rice (130 Kcal)", "Curd & Bread": "Lauki Mint Raita (60 Kcal), Roti (110 Kcal)", "Accompaniment": "Fryums (120 Kcal)" },
                snacks: { "Snack": "Samosa (250 Kcal), Imly Chutney (12 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Sambhar (135 Kcal), Kerala Urulai Roast (150 Kcal), Mint Rice (150 Kcal)", "North Indian": "Dal Makhni (360 Kcal), Seasonal Vegetable, Plain Rice (130 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Green Salad (40 Kcal)", "Dessert": "Gajar Ka Halwa (260 Kcal) / Ice Cream (110 Kcal)" }
            }
        },
        {
            day: 'Saturday', meals: {
                breakfast: { "North Indian": "Plain Prantha (200 Kcal), Soya Paneer Bhurji (145 Kcal)", "Continental": "Indori Poha (150 Kcal), Tomato Ketchup (10 Kcal)", "South Indian": "Medu Vada with Sambhar (150 Kcal), Peanut Chutney (27 Kcal)", "Essentials": "Brown Bread (120 Kcal), Jam (15 Kcal), Butter (70 Kcal), Seasonal Fruit", "Beverage": "Masala Tea (60 Kcal), Coffee (45 Kcal), Plain Milk (110 Kcal)" },
                lunch: { "South Indian": "Sambhar (120 Kcal), Cabbage 65 (180 Kcal), Andhra Veg Biryani (155 Kcal)", "North Indian": "Rajma (125 Kcal), Kadai Paneer (120 Kcal), Jeera Rice (130 Kcal)", "Curd & Bread": "Lauki Mint Raita (60 Kcal), Roti (110 Kcal)", "Accompaniment": "Green Salad (40 Kcal) + Imly Chutney (12 Kcal)" },
                snacks: { "Snack": "Hakka Noodles (150 Kcal), Tomato Ketchup (10 Kcal)", "Beverage": "Tea (60 Kcal), Coffee (45 Kcal)" },
                dinner: { "South Indian": "Kandhi Pappu (120 Kcal), Seasonal Vegetable, Mint Rice (150 Kcal)", "North Indian": "Panchratani Dal (110 Kcal), Mix Veg (110 Kcal), Corn Coriander Pulao (140 Kcal)", "Breads": "Roti (110 Kcal)", "Accompaniments": "Fryums (120 Kcal)", "Dessert": "Fruit Custard (95 Kcal)" }
            }
        }
    ]
};
