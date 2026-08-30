export type MealCategories = { [key: string]: string; };
export type MealPlan = { breakfast: MealCategories; lunch: MealCategories; snacks: MealCategories; dinner: MealCategories; };
export type DayMenu = { day: string; meals: MealPlan; };
export type WeeklyMenu = DayMenu[];

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MESS_DATA: { week1: WeeklyMenu; week2: WeeklyMenu } = {
    week1: [
        {
            day: 'Sunday',
            meals: {
                breakfast: {
                    "North Indian": "Aloo Prantha, Pickle",
                    "Continental / Item 2": "Cold Sandwich, Tomato Ketchup",
                    "South Indian": "Mysore Bonda, Peanut Chutney",
                    "Essentials": "White Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Kara Kuzhambu, Aloo Curry, Pulyodharai",
                    "North Indian": "Pindi Chhole, Aloo Pyaz Masaledar, Plain Rice",
                    "Curd & Bread": "Onion Raita, Roti and Bhatura",
                    "Accompaniment": "Pickled Salad"
                },
                snacks: {
                    "Snack": "Kulcha, Nutri Gravy",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Mysore Sambhar, Seasonal Vegetable, Plain Rice",
                    "North Indian": "Moong Chhilka Dal, Aloo Beans, Bhuna Onion Pulao",
                    "Breads & Salad": "Roti, Fryums",
                    "Dessert": "Gulab Jamun"
                }
            }
        },
        {
            day: 'Monday',
            meals: {
                breakfast: {
                    "North Indian": "Stuffed Mix Prantha, Packed Curd",
                    "Continental / Item 2": "Veg. Stuffed Toast, Tomato Ketchup",
                    "South Indian": "Idli with Sambhar, Peanut Chutney",
                    "Healthy Option": "Mix Dal Sprouts",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Mudha Pappu, Tomato Meal Maker, Plain Rice",
                    "North Indian": "Dal Makhni, Seasonal Vegetable, Veg Pulao",
                    "Curd & Bread": "Boondi Raita, Roti",
                    "Accompaniment": "Fryums"
                },
                snacks: {
                    "Snack": "Bread Roll, Tomato Ketchup",
                    "Beverage": "Tea, Lemon Water"
                },
                dinner: {
                    "South Indian": "Majjiga Pulusu, Paneer Curry, Soya Biryani",
                    "North Indian": "Yellow Dal Fry, Palak Paneer / Kadai Paneer, Plain Rice",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Semya Kheer"
                }
            }
        },
        {
            day: 'Tuesday',
            meals: {
                breakfast: {
                    "North Indian": "Poori, Aloo Curry",
                    "Continental / Item 2": "Black Chana Masala, Tomato bath",
                    "South Indian": "Peanut Chutney",
                    "Essentials": "White Bread, Jam, One Sachet Butter, Banana",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Vankaya Curry, Mix Veg Kurma, Lemon Rice",
                    "North Indian": "Rajma, Mix Veg, Plain Rice",
                    "Curd & Bread": "Mix-Veg Raita, Roti",
                    "Accompaniment": "Green Salad"
                },
                snacks: {
                    "Snack": "Vada Pav, Tomato Ketchup",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Beerakaya Pappu, Vada Curry, Plain Rice",
                    "North Indian": "Sabut Masoor Dal, Mushroom Matar / Methi Malai Matar, Veg Dum Biryani",
                    "Breads & Salad": "Roti, Appalam",
                    "Dessert": "Besan Burfi"
                }
            }
        },
        {
            day: 'Wednesday',
            meals: {
                breakfast: {
                    "North Indian": "Kulcha (Toasted), Chana / Matar Gravy",
                    "Continental / Item 2": "Vermicelli Upma, Coconut Chutney",
                    "South Indian": "Mix Veg Uthappam, Peanut Chutney",
                    "Healthy Option": "Ragi Porridge",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Tomato Pappu, Veg 65 / Mirchi Bajji, Curd Rice",
                    "North Indian": "Yellow Dal Fry, Seasonal Vegetable, Jeera Onion Pulao",
                    "Curd & Bread": "Lauki Mint Raita, Roti",
                    "Accompaniment": "Green Salad"
                },
                snacks: {
                    "Snack": "Bombay Sandwich, Tomato Ketchup",
                    "Beverage": "Tea, Rooh Afza"
                },
                dinner: {
                    "South Indian": "Parippu Sambhar, Potato Peas Poriyal, Plain Rice",
                    "North Indian": "Maah Ki Dal, White Channa Masala (Dry), Plain Rice",
                    "Breads & Salad": "Roti, Fryums",
                    "Dessert": "Rasgulla"
                }
            }
        },
        {
            day: 'Thursday',
            meals: {
                breakfast: {
                    "North Indian": "Plain Prantha, Aloo Bhujia",
                    "Continental / Item 2": "Vegetable Macaroni, Tomato Ketchup",
                    "South Indian": "Minapa Punugulu, Peanut Chutney",
                    "Essentials": "White Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Pachi Pulusu, Seasonal Veg, Plain Rice",
                    "North Indian": "Punjabi Kadhi Pakoda, Aloo Matter Gravy, Plain Rice",
                    "Curd & Bread": "Plain Curd, Roti",
                    "Accompaniment": "Pickled Salad"
                },
                snacks: {
                    "Snack": "Hakka Noodles, Tomato Ketchup",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Kandhi Pappu, Meal Maker Curry, Plain Rice",
                    "North Indian": "Dal Palak, Paneer Do Pyaza, Matar Pulao",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Gajar Ka Halwa / Ice Cream"
                }
            }
        },
        {
            day: 'Friday',
            meals: {
                breakfast: {
                    "North Indian": "Stuffed Mooli / Onion Prantha, Packed Curd",
                    "Continental / Item 2": "Aloo Bonda, Curd Rice",
                    "South Indian": "Vegetable Rawa Upma, Coconut Chutney",
                    "Healthy Option": "Steamed Vegetables",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter, Seasonal Fruit",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Sambhar, Bagara Baingan, Plain Rice",
                    "North Indian": "Black Channa, Mix Veg Kofta, Veg Pulao",
                    "Curd & Bread": "Jeera Raita, Roti",
                    "Accompaniment": "Green Salad"
                },
                snacks: {
                    "Snack": "Bread Pakoda, Tomato Ketchup",
                    "Beverage": "Tea, Cold Coffee"
                },
                dinner: {
                    "South Indian": "Senaga Pappu, Seasonal Vegetable, Tomato Rice",
                    "North Indian": "Ghia Chana Dal, Mix Veg, Plain Rice",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Balushahi / Coconut Laddu"
                }
            }
        },
        {
            day: 'Saturday',
            meals: {
                breakfast: {
                    "North Indian": "Soya Paneer Prantha, Pickle",
                    "Continental / Item 2": "Indori Poha, Tomato Ketchup",
                    "South Indian": "Medu Vada with Sambhar, Peanut Chutney",
                    "Essentials": "White Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Paruppu Urundai Kulambu, Chettinad Mushroom, Khuska",
                    "North Indian": "Matar Paneer / Matar Mushroom, Seasonal Vegetable, Plain Rice",
                    "Curd & Bread": "Dahi Bhalla, Roti",
                    "Accompaniment": "Green Salad and Imly Chutney"
                },
                snacks: {
                    "Snack": "Samosa, Tomato Ketchup",
                    "Beverage": "Tea, Cold Coffee"
                },
                dinner: {
                    "South Indian": "Vengaya Sambhar (Onion), Arbi Vepudu, Soya & Matar Dum Biryani",
                    "North Indian": "Rajma, Aloo Shimla, Plain Rice",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Moong Dal Halwa / Besan Laddoo"
                }
            }
        }
    ],
    week2: [
        {
            day: 'Sunday',
            meals: {
                breakfast: {
                    "North Indian": "Stuffed Mix Prantha, Pickle",
                    "Continental / Item 2": "Mangalore Baji, Coriander Coconut Chutney",
                    "South Indian": "Hot Pongal, Tomato Gojju",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Garlic Pepper Rasam, Gutti Vankaya, Tomato Rice",
                    "North Indian": "Pindi Chhole, Aloo Chatpate, Jeera Rice",
                    "Curd & Bread": "Plain Curd, Roti and Bhatura",
                    "Accompaniment": "Green Salad"
                },
                snacks: {
                    "Snack": "Veg Coleslaw S/W, Green Chutney",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Thakkali Sambhar, Seasonal Vegetable, Plain Rice",
                    "North Indian": "Hari Moong Dal, Nutri Chilly, Veg Pulao",
                    "Breads & Salad": "Roti, Fryums",
                    "Dessert": "Suji Halwa"
                }
            }
        },
        {
            day: 'Monday',
            meals: {
                breakfast: {
                    "North Indian": "Stuffed Aloo Prantha, Packed Curd",
                    "Continental / Item 2": "Vermicelli Upma, Tomato Ketchup",
                    "South Indian": "Minapa Punugullu, Coconut Chutney",
                    "Healthy Option": "Moong Sprouts",
                    "Essentials": "White Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Chamadadda Pulusu, Vegetable Sagu, Curd Rice",
                    "North Indian": "Dal Makhni, Seasonal Vegetable, Plain Rice",
                    "Curd & Bread": "Cucumber / Ghiya Raita, Roti",
                    "Accompaniment": "Fryums"
                },
                snacks: {
                    "Snack": "Veg Bajji, Green Chutney",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Tomato Pappu, Aloo Gadda Vepudu, Chitranna Rice",
                    "North Indian": "Yellow Moong Dal, Seasonal Vegetable, Plain Rice",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Sweet Pongal"
                }
            }
        },
        {
            day: 'Tuesday',
            meals: {
                breakfast: {
                    "North Indian": "Plain Prantha, Hing Jeera Aloo (Dry)",
                    "Continental / Item 2": "Sweet Dalia, Tomato Ketchup",
                    "South Indian": "Masala Vegetable Idli, Coconut Chutney",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Drum Stick Sambhar, Potato 65, Coconut Rice",
                    "North Indian": "Lobia Dal, Mix Veg, Plain Rice",
                    "Curd & Bread": "Mix-Veg Raita, Roti",
                    "Accompaniment": "Green Salad"
                },
                snacks: {
                    "Snack": "French Fries, Tomato Ketchup",
                    "Beverage": "Tea, Lemon Water"
                },
                dinner: {
                    "South Indian": "Beerakaya Pappu, Paneer Chettinad Curry, Coconut Rice",
                    "North Indian": "Maah Chana Dal, Paneer Butter Masala, Plain Rice",
                    "Breads & Salad": "Roti, Appalam",
                    "Dessert": "Gulab Jamun"
                }
            }
        },
        {
            day: 'Wednesday',
            meals: {
                breakfast: {
                    "North Indian": "Poori, Aloo Chana Curry",
                    "Continental / Item 2": "Cold Sandwich, Pickled Onion",
                    "South Indian": "Vegetable Rawa Upma, Coconut Chutney",
                    "Healthy Option": "Soyaseed Sprouts",
                    "Essentials": "White Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Palakura Pappu, Mix Veg Curry, Pudina Rice",
                    "North Indian": "Sabut Masoor Dal, Seasonal Vegetable, Plain Rice",
                    "Curd & Bread": "Boondi Raita, Roti",
                    "Accompaniment": "Green Salad"
                },
                snacks: {
                    "Snack": "Pav, Bhaji",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Pasi Parappu Sambhar, Donda Kaya Fry, Puliyodharai",
                    "North Indian": "Rajma Rasila, Mix Veg, Veg Pulao",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Besan Burfi"
                }
            }
        },
        {
            day: 'Thursday',
            meals: {
                breakfast: {
                    "North Indian": "Missa Prantha, Pickle",
                    "Continental / Item 2": "Vegetable Macaroni, Tomato Ketchup",
                    "South Indian": "Idli with Sambhar, Coconut Chutney",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Pappu Charu, Seasonal Veg, Soya Biryani",
                    "North Indian": "Punjabi Kadhi Pakoda, Dum Aloo, Plain Rice",
                    "Curd & Bread": "Majjiga Pulusu, Roti",
                    "Accompaniment": "Pickled Salad"
                },
                snacks: {
                    "Snack": "Kachouri, Aloo Sabji",
                    "Beverage": "Tea, Rooh Afza"
                },
                dinner: {
                    "South Indian": "Sambhar, Avail, Plain Rice",
                    "North Indian": "White Chana, Manchurian, Fried Rice / Noodles",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Boondi Laddu"
                }
            }
        },
        {
            day: 'Friday',
            meals: {
                breakfast: {
                    "North Indian": "Plain Prantha, Soya Paneer Bhurji",
                    "Continental / Item 2": "Aloo Bonda, Coconut Chutney",
                    "South Indian": "Vermicelli Upma, Tomato Ketchup",
                    "Essentials": "White Bread, Jam, One Sachet Butter, Seasonal Fruit",
                    "Beverage": "Masala Tea, Coffee"
                },
                lunch: {
                    "South Indian": "Mysore Sambhar, Veg 65 / Cabbage 65, Plain Rice",
                    "North Indian": "Arhar Dal, Soya Chaap Masala, Jeera Rice",
                    "Curd & Bread": "Plain Curd, Roti",
                    "Accompaniment": "Fryums"
                },
                snacks: {
                    "Snack": "Samosa, Imly Chutney",
                    "Beverage": "Tea, Coffee"
                },
                dinner: {
                    "South Indian": "Meal Maker Curry, Kerala Urulai Roast, Plain Rice",
                    "North Indian": "Dal Makhni, Seasonal Vegetable, Vegetable Khichdi",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Gajar Ka Halwa / Ice Cream"
                }
            }
        },
        {
            day: 'Saturday',
            meals: {
                breakfast: {
                    "North Indian": "Stuffed Gobhi / Onion Prantha, Packed Curd",
                    "Continental / Item 2": "Indori Poha, Tomato Ketchup",
                    "South Indian": "Medu Vada with Sambhar, Peanut Chutney",
                    "Healthy Option": "Broken Wheat Upma",
                    "Essentials": "Brown Bread, Jam, One Sachet Butter",
                    "Beverage": "Masala Tea, Coffee, Plain Milk"
                },
                lunch: {
                    "South Indian": "Cabbage Pappu, Paneer Curry, Andhra Veg Biryani",
                    "North Indian": "Rajma, Kadai Paneer, Plain Rice",
                    "Curd & Bread": "Dahi Bhalla, Roti",
                    "Accompaniment": "Green Salad, Imly Chutney"
                },
                snacks: {
                    "Snack": "Hakka Noodles",
                    "Beverage": "Tea, Tang"
                },
                dinner: {
                    "South Indian": "Kandhi Pappu, Seasonal Vegetable, Plain Rice",
                    "North Indian": "Panchratani Dal, Mix Veg, Jeera Rice",
                    "Breads & Salad": "Roti, Green Salad",
                    "Dessert": "Fruit Custard"
                }
            }
        }
    ]
};
