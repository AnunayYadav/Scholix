export interface Facility {
  name: string;
  location: string;
  category: string;
  itemsOffered?: string[];
}

export const FACILITIES_DATA: Facility[] = [
  // ATM
  { name: "Bank of Baroda", location: "Block-15-BOB ATM", category: "ATM" },
  { name: "Bank of Baroda", location: "Block-32- L1-ATM1", category: "ATM" },
  { name: "Kotak Mahindra Bank Limited", location: "Block-15-KMB- ATM", category: "ATM" },
  { name: "OBC", location: "Block-32-L1-ATM4", category: "ATM" },
  { name: "State Bank of India", location: "Block-15- SBI ATM1-1", category: "ATM" },
  { name: "State Bank of India", location: "Block-15- SBI ATM1-2", category: "ATM" },
  { name: "State Bank of India", location: "Block-15- Shop No 207", category: "ATM" },
  // Automobiles
  { name: "lovely autos", location: "Jalandhar-1", category: "Automobiles" },
  // Bakery
  { name: "Lovely Bake Studio", location: "Block-41-L1-Bake Studio-1", category: "Bakery" },
  // Bank
  { name: "HDFC E-Lobby", location: "Block-15- Shop No 206", category: "Bank" },
  { name: "ICICI Bank Limited", location: "Block-15- Shop No 204 & 205", category: "Bank" },
  { name: "OBC", location: "Block-2-L1-Bank", category: "Bank" },
  { name: "OBC E Lobby", location: "Block-2-eLobby", category: "Bank" },
  { name: "State Bank of India", location: "Block-15- Shop No 208", category: "Bank" },
  { name: "State Bank of India", location: "Block-15- Shop No 209", category: "Bank" },
  // Beverages
  { name: "Juice World", location: "Block-8-Outside-Kiosk", category: "Beverages" },
  { name: "The Juicy Cafe", location: "Block-45-Market-K2", category: "Beverages", itemsOffered: ["Juice", "Shake", "Fruit Salad", "Anar Juice", "Lime Soda"] },
  { name: "Fruit Shoot", location: "Block-41-Market-K2", category: "Beverages", itemsOffered: ["Fresh Juices", "Shakes", "Lassi", "Mojitos", "Fruit & Vegetable Salad", "Lime Soda/ Lemon Water"] },
  { name: "Ahuja Shakes & Refreshments", location: "Block-15- Shop No 607-1", category: "Beverages", itemsOffered: ["Juices", "Mocktails", "Shakes", "Hot coffee", "Tea", "Soft drink", "Fruit Salad", "Maggi", "sandwich", "cold sandwiches", "Samosaa", "Patty"] },
  { name: "Cafe Coffee Day", location: "Block-15- Shop No 102.1", category: "Beverages" },
  // Book Shop
  { name: "Study Solution", location: "Block-15- Shop No 310", category: "Book Shop" },
  { name: "Gaurav Book Shop", location: "Block-15- Shop No 308 & 309", category: "Book Shop" },
  // Cafeteria
  { name: "Bajaj Caterers", location: "Block-23-GH-5A-L1", category: "Cafeteria" },
  { name: "NeelKanth", location: "Block-48-BH-2-L1-Canteen", category: "Cafeteria" },
  { name: "Cafe 24x7", location: "Block-8-L2-Cafe", category: "Cafeteria" },
  { name: "Chai Bar", location: "Block-32-L1-Cafe", category: "Cafeteria" },
  { name: "Jai Surya Dev Mess", location: "Block-49-BH-3-Canteen", category: "Cafeteria" },
  { name: "cafe 7x11", location: "Block-3-L2-Cafe", category: "Cafeteria" },
  { name: "Indian Cafe", location: "Block-9-GH-1-Cafe", category: "Cafeteria" },
  { name: "Shiv Shankar Caters", location: "Block-51-BH-4-Cafe-1", category: "Cafeteria" },
  { name: "Siya Refreshment", location: "Block-38-L5-Canteen", category: "Cafeteria" },
  { name: "Kitchen Ette", location: "Block-45-BH-1-Cafe", category: "Cafeteria" },
  { name: "Buzz", location: "Block-41-Market Shed Food Court", category: "Cafeteria" },
  { name: "M/s PR Terrace Cafe", location: "Block-28-L5-Cafe-1", category: "Cafeteria" },
  { name: "Apna Zaika", location: "Block-49-BH-3-Cafe1", category: "Cafeteria" },
  // Car Wash
  { name: "Singh Car Wash", location: "Block-45-BH-1-Carwash2", category: "Car Wash" },
  // Career Service
  { name: "The English Monk", location: "Block-13- Room No.101", category: "Career Service" },
  { name: "Aptiguide", location: "Block-13- Room No.210-Cabin No.-17", category: "Career Service" },
  { name: "Externsclub Private Limited", location: "Block-13-210- Cubicle No.19", category: "Career Service" },
  { name: "Korean Photobooth", location: "Block-15- Shop No 405", category: "Career Service" },
  { name: "Take A Break Reloaded", location: "Block-13-110-Cubicle No.2.1", category: "Career Service" },
  // Computer Cafe
  { name: "Jai Sai Computer", location: "Block-15- Shop No 320", category: "Computer Cafe" },
  { name: "Common Services Centre", location: "Block-15- Shop No 311", category: "Computer Cafe" },
  // Computer Repair
  { name: "Superdot Computer", location: "Block-15- Shop No 317", category: "Computer Repair" },
  { name: "LENOVO", location: "Block-15- Shop No 318", category: "Computer Repair" },
  { name: "Touch Automation Pvt Ltd", location: "Block-15- Shop No 316", category: "Computer Repair" },
  { name: "VN Computers", location: "Block-15- Shop No 315", category: "Computer Repair" },
  // Courier
  { name: "Blue Dart Express Ltd.", location: "Block-15- Shop No 303", category: "Courier" },
  { name: "Amazon", location: "Block-15- Shop No 417", category: "Courier Services" },
  { name: "AMAR COURIER SERVICE", location: "Block-15- Shop No 412-1", category: "Courier Services" },
  { name: "Delhivery", location: "Block-15- Shop No 420.", category: "Courier Services" },
  { name: "Xpressbees", location: "Block-15- Shop No 416", category: "Courier Services" },
  { name: "Meesho Courier", location: "Block-15- Shop No 418.1", category: "Courier Services" },
  // Departmental Store
  { name: "Kamla Devi Smart shop", location: "Block-9-GH-1-L2-Store", category: "Departmental Store" },
  { name: "Departmental Store", location: "Block-11-GH-3-L2", category: "Departmental Store" },
  { name: "W.S. Smith", location: "Block-41-Store", category: "Departmental Store" },
  { name: "W.S. Smith", location: "Block-45-BH-1-L1-Store", category: "Departmental Store" },
  { name: "W.S. Smith", location: "Block-51-BH-4-Store", category: "Departmental Store" },
  { name: "W.S. Smith", location: "Block-53-BH-5-Store", category: "Departmental Store" },
  { name: "W.S. Smith", location: "Block-54-BH-6-Store", category: "Departmental Store" },
  { name: "Sanjay General Store", location: "Block-23-GH-5-L1", category: "Departmental Store" },
  { name: "Le Broc", location: "Block-15- Shop No 101-1", category: "Departmental Store" },
  { name: "Le Broc", location: "Block-48-BH-2-Store", category: "Departmental Store" },
  { name: "Le Broc", location: "Block-49 Boys Hostel 3", category: "Departmental Store" },
  // E-Rickshaw
  { name: "DSA Kites", location: "e-cart- Campus Bus", category: "E-Rickshaw" },
  { name: "DSA Kites", location: "e-cart-Campus Train", category: "E-Rickshaw" },
  { name: "DSA Kites", location: "Golf Cart-10 Seats", category: "E-Rickshaw" },
  { name: "DSA Kites", location: "Golf Cart-5 Seats", category: "E-Rickshaw" },
  { name: "DSA Kites", location: "Golf Cart-7 Seats", category: "E-Rickshaw" },
  { name: "Horse", location: "Block-5-nearby Animal house Warehouse", category: "E-Rickshaw" },
  // Entertainment Zone
  { name: "SVS Services", location: "Block-15B Level 1", category: "Entertainment Zone" },
  { name: "XL Arena", location: "Block-48- Opp Bh-2-XL Arena", category: "Entertainment Zone" },
  { name: "Valour Esports", location: "Block-15- Shop No 404.", category: "Entertainment Zone" },
  // Food Kiosks
  { name: "Varindhavan Bakery", location: "Block-45-Market-K11", category: "Food Kiosks", itemsOffered: ["Lassi", "Tea/Coffee/Ice tea", "Expresso Coffee", "Ice cream", "Maggi"] },
  { name: "Sandy Sandwich", location: "Block-45-Market-K20", category: "Food Kiosks", itemsOffered: ["Grilled Sandwich", "Burger", "Pizza", "Pasta/Salad", "Frech Fries", "Momos", "Garlic Bread", "Combo"] },
  { name: "AB Juice Bar", location: "Block-45-Market-K5-1", category: "Food Kiosks", itemsOffered: ["Majito", "Juice", "Shake", "Fruit Salad", "Anar Juice", "Lime Soda"] },
  { name: "Veggie Gril", location: "Block-45-Market-K12", category: "Food Kiosks", itemsOffered: ["Burger", "Spring Roll", "Pasta", "Momos", "Wrap Roll", "Pizza"] },
  { name: "Soya Protien House", location: "Block-41-Market-K8", category: "Food Kiosks", itemsOffered: ["burger", "Sandwich", "Sub", "Salads", "Wraps", "Sweet Potato", "Healthy Shakes"] },
  { name: "Govind Food Corner", location: "Block-45-Market-K9", category: "Food Kiosks", itemsOffered: ["Lovely Bake all items", "Aloo Puri", "Channa kulcha", "Poha", "Channa Samosa", "Bun Tikki"] },
  { name: "Protein House", location: "Block-45-Market-K45", category: "Food Kiosks", itemsOffered: ["Burgers", "wraps", "Subs", "Sandwich", "Salad", "crushers"] },
  { name: "Jacked up Cafe", location: "Block-15- Shop No 605", category: "Food Kiosks", itemsOffered: ["Shakes", "Mojitos", "Coffee", "Sandwich", "French Fries", "Pizza", "Burger", "Wraps"] },
  { name: "Oven Xpress", location: "LIT Parking, LPU CC (LIT Market)", category: "Food & Beverages", itemsOffered: ["Veg Biryani (₹80)", "Paneer Biryani (₹100)", "Veg Handi Biryani (₹180)", "Paneer Handi Biryani (₹220)", "Veg Fried Rice (₹80)", "Paneer Fried Rice (₹120)", "Tandoori Chaap (₹100)", "Malai Chaap (₹120)", "Afgani Chaap (₹120)", "Tandoori Paneer Momo (₹120)", "Tandoori Veg Momo (₹100)", "Paneer Tikka (₹180)", "Mah Dal Fry (₹80)", "Aloo Methi (₹80)"] },
  { name: "Bokki Tokki", location: "LIT Market, LPU CC (LIT Market)", category: "Food & Beverages", itemsOffered: ["Korean Corndog (₹69)", "Cheesy Momo (₹69)", "Jhol Momo (₹69)", "Wai Wai Laphings (₹49)", "Makhni Tteok (₹99)", "Sparkling Water (₹60)", "Mojitos (₹49)", "Nutri Momo (₹70)", "Mix Veg Momo (₹70)", "Cold Drink (₹40)"] },
  { name: "Purebites", location: "Unimall Basement, Block 15", category: "Food & Beverages", itemsOffered: ["Salted Fries (₹79)", "Peri Peri Fries (₹99)", "Cheese Loaded Fries (₹119)", "Paneer Loaded Fries (₹139)", "Soya Chaap Combo (₹89)", "White Sauce Pasta (₹129)", "Red Sauce Pasta (₹139)", "Mix Sauce Pasta (₹139)", "Veg Biryani (₹119)", "Hyderabadi Veg Biryani (₹139)"] },
  { name: "Jacked Up (LIT)", location: "LIT Market, LPU CC (LIT Market)", category: "Food & Beverages", itemsOffered: ["Cottage Cheese Salad (₹89)", "Crispy Nachos & Cheese (₹89)", "White Sauce Nachos (₹89)", "Red Sauce Nachos (₹89)", "Mexican Street Nachos (₹89)", "Fresh Sandwich (₹59)", "Crispy Grilled Sandwich (₹69)", "The Heavy Weight Sandwich (₹79)", "Cheesemelts Sandwich (₹89)", "Cheese Corn Sandwich (₹89)", "Paneer Tikka Sandwich (₹99)", "Makhani Paneer Sandwich (₹99)", "Classic Fries (₹79)", "Peri Peri Fries (₹89)", "Nachos Fries (₹89)", "Cheese Fries (₹99)", "Pizza Fries (₹99)", "Makhani Fries (₹99)", "Loaded Fries (₹149)"] },
  { name: "Taco Town Cafe", location: "Unimall 6th Floor", category: "Food & Beverages", itemsOffered: ["Margherita Pizza (₹80)", "Corn Pizza (₹80)", "Capsicum Pizza (₹80)", "Onion Pizza (₹80)", "Tomato Pizza (₹80)", "Veg Delight Pizza (₹150)", "Paneer Delight Pizza (₹180)", "Golden Delight Pizza (₹160)"] },
  { name: "Rolls Empire", location: "LPU CC (LIT Market)", category: "Food & Beverages", itemsOffered: ["Mix Veg Roll (₹49)", "Aloo Tikki Creamy Roll (₹59)", "Noodle Roll (₹59)", "Malai Chaap Roll (₹59)", "Afghani Chaap Roll (₹69)", "Chilli Chaap Roll (₹69)", "Achari Chaap Roll (₹79)", "Paneer Tikka Roll (₹79)", "Paneer Bhurji Roll (₹89)", "Paneer Malai Roll (₹89)", "Chilli Paneer Roll (₹99)", "Achari Paneer Roll (₹99)", "Tandoori Paneer Roll (₹99)"] },
  { name: "SCF Chaap & Kabab", location: "LIT Market, LPU", category: "Food & Beverages", itemsOffered: ["Malai Chaap (₹95)", "Afgani Chaap (₹95)", "Chatpati Chaap (₹95)", "Tandoori Chaap (₹95)", "Paneer Tikka (₹95)", "Stuffed Tandoori Chaap (₹110)", "Tawa Chaap (₹100)", "Tawa Paneer (₹100)", "Tawa Tikka Masala (₹100)", "Veg Korma (₹110)", "Keema Naan with Gravy (₹110)", "Tandoori Roti (₹12)"] },
  { name: "Arab Restaurant", location: "LIT Market, Phagwara", category: "Food & Beverages", itemsOffered: ["Paneer Shawarma (₹70)", "Chole Bhature (₹70)", "Aloo Puri (₹70)", "Pav Bhaji (₹60)", "Chana Puri (₹70)", "Aloo Paratha Thali (₹70)", "Paneer Parantha Thali (₹80)", "Laccha Parantha Thali (₹70)", "Normal Thali (₹70)", "Special Thali (₹100)", "Delight Thali (₹100)", "Super Delight Thali (₹120)", "Aloo Parantha (₹30)", "Mix Parantha (₹40)", "Paneer Parantha (₹40)", "Onion Parantha (₹40)"] },
  { name: "The Tandoori Hub", location: "LPU CC (LIT Market)", category: "Food & Beverages", itemsOffered: ["Aloo Naan with Channa (₹75)", "Aloo Naan with Gravy Chaap (₹85)", "Aloo Naan with Nutri (₹75)", "Aloo Naan with Paneer (₹85)", "Atta Aloo Naan with Channa (₹85)", "Atta Aloo Naan with Paneer (₹95)", "Kulcha with Channa (₹65)", "Kulche with Gravy Chaap (₹65)", "Kulche with Nutri (₹65)", "Kulche with Paneer (₹75)", "Extra Kulcha (₹20)"] },
  { name: "Snack Bar", location: "LPU CC (LIT Market)", category: "Food & Beverages", itemsOffered: ["Veg Crispy Burger (₹60)", "Cream Burger (₹60)", "Mushroom Burger (₹70)", "Paneer Tikka Burger (₹70)", "Maharaja Burger (₹90)", "Mexican Burger (₹110)", "Veg Sandwich (₹90)", "Corn Sandwich (₹90)", "Paneer Tikka Sandwich (₹110)", "French Fries (₹80)", "Peri Peri Fries (₹85)", "Masala Fries (₹90)", "Veg Wrap (₹60)", "Corn Wrap (₹70)", "Mushroom Wrap (₹80)", "Aloo Tikki Wrap (₹80)", "Paneer Wrap (₹80)", "Veg Rice Bowl (₹60)"] },
  { name: "Jacked Up Cafe (Unimall)", location: "Unimall 6th Floor", category: "Food & Beverages", itemsOffered: ["Veggie Wrap (₹79)", "Aloo Tikki Wrap (₹89)", "Tandoori Paneer Wrap (₹109)", "Makhani Paneer Wrap (₹109)", "Cheese Corn Wrap (₹99)", "Falafel Wrap (₹99)", "White Sauce Pasta (₹99)", "Super Cheesy Pizza (₹199)", "Cheese Burst Pizza (₹259)", "Farm House Pizza (₹259)", "Paneer Tikka Pizza (₹259)", "Makhani Paneer Pizza (₹259)", "Exotic Vegetables Pizza (₹229)", "Mexican Quesadilla (₹99)", "Corn Quesadilla (₹99)", "Achari Quesadilla (₹109)", "Paneer Quesadilla (₹129)", "Cottage Cheese Salad (₹99)", "Crispy Nachos & Cheese (₹99)", "Lemon & Mint Salad (₹99)", "White Sauce Nachos (₹99)"] },
  { name: "Food Bowl", location: "Shop No 603, Unimall 6th Floor", category: "Food & Beverages", itemsOffered: ["Mix Veg Uttappa (₹109)", "Podi Roast Dosa (₹109)", "Hot Coffee (₹69)", "Salted Fries (₹99)", "Schezwan Masala Dosa (₹129)", "Cold Coffee (₹109)", "Iced Lemon Tea (₹69)", "Iced Peach Tea (₹69)", "Onion Roast Dosa (₹119)", "Onion Masala Dosa (₹119)", "Sweet Lassi (₹69)", "Salty Lassi (₹69)", "Pav Bhaji (₹99)", "Cheese Masala Dosa (₹139)", "Paneer Masala Dosa (₹139)", "Sada Dosa (₹89)", "Mysore Masala Dosa (₹109)", "Garlic Roast Dosa (₹109)", "Paneer Sada Dosa (₹149)", "Maharaja Masala Dosa (₹139)", "Ghee Roast Dosa (₹109)", "Cheese Sada Dosa (₹149)", "Ghee Masala Dosa (₹129)", "Coke (₹20)"] },
  { name: "AB Chinese & Juice", location: "Shop No 4-5, BH-1 Market", category: "Food & Beverages", itemsOffered: ["Aloo Tikki Burger (₹40)", "Noodles Burger (₹50)", "Cheese Burger (₹60)", "Paneer Burger (₹60)", "Double Tikki Burger (₹60)", "Crispy Aloo Tikki (₹80)", "French Fries Burger (₹60)", "Manchurian Burger (₹60)", "Fresh Pineapple Juice (₹70)", "Fresh Fruit Salad (₹60)"] },
  { name: "Mama's Kitchen", location: "Block-18-Market-K1", category: "Food Kiosks", itemsOffered: ["Prantha"] },
  { name: "OM Sai Caters", location: "Block-20-Market-K2", category: "Food Kiosks", itemsOffered: ["Thali", "Rice bowl", "patties", "samosaa", "burger", "sandwich", "pasta", "ice tea", "wrap", "maggie", "momos", "prantha", "Milk Shakes", "tea", "coffee"] },
  { name: "Khao Piyo", location: "Block-45-Market-K7", category: "Food Kiosks", itemsOffered: ["Litti Chokha", "Veg Roll", "Chaat", "Pav Bhaji", "Momos", "Khichdi", "Vada Pav"] },
  { name: "Fruit Shoot", location: "Block-45-Market-K13-1", category: "Food Kiosks", itemsOffered: ["Fresh Juices", "Shakes", "Lassi", "Fruit Salad", "Ice Cream", "Paan", "Rabri Faluda"] },
  { name: "Hangouts", location: "Block-45-Market-K24", category: "Food Kiosks", itemsOffered: ["Idli", "Dosa", "Vada", "Punugulu", "Bonda/Onion Bonda", "Uggani /Borugu (All Without Samber)"] },
  { name: "Hangouts", location: "Block-45-Market-K25-1", category: "Food Kiosks", itemsOffered: ["Poori/Bhutra/Aloo Sabji", "Raggi Sanket", "Pongal", "Purnalu/Malpuri", "Jabebi"] },
  { name: "Pakka Adda", location: "Block-45-Market-K23-1", category: "Food Kiosks", itemsOffered: ["Noodles", "Momos", "Potato Dishes", "Sweet Corn", "Chilly paneer", "Kathi Roll", "Sandwich", "Pizza", "Pasta/Salad", "Jelabi", "Wrap roll", "Burger"] },
  { name: "Tummy Charger", location: "Block-45-Market-K4-1", category: "Food Kiosks", itemsOffered: ["Burger", "Noodles", "Honey Chilli Potato", "Momos", "French Fries", "Manchurian", "Rolls", "Combo"] },
  { name: "Master Chef Kitchen", location: "Block-45-Market-K3-1", category: "Food Kiosks", itemsOffered: ["Burger", "Noodles", "Honey Chilli Potato", "Momos", "French Fries", "Manchurian"] },
  { name: "Amul Ice Cream Parlour", location: "Block-45-Market-K31-1", category: "Food Kiosks", itemsOffered: ["ice cream", "Sunday's", "shakes", "amul products"] },
  { name: "A Pizza Bar", location: "Block-41-Market-K3-4", category: "Food Kiosks", itemsOffered: ["Pizza", "Burger", "Sandwich", "Momos", "French Fries", "Mojitos", "Pasta"] },
  { name: "Madurai Special", location: "Block-45-Market-K30-1", category: "Food Kiosks", itemsOffered: ["Dosa", "Idli", "Vada", "Paniyaaram"] },
  { name: "Nanki Foods", location: "Block-45-Market-K34-1", category: "Food Kiosks", itemsOffered: ["Paneer Tikka", "Soya Masala chaap", "Mushrrom Tikka", "Paneer Wrap", "Doner Kebab", "Potato wedges/Cheesy fries", "Kulcha /Naan/Channa"] },
  // Food Shops
  { name: "Lovely Sweets", location: "Block-15- Shop No 201,202 & 203", category: "Food Shops" },
  { name: "Dominos Pizza", location: "Block-15- Shop No 217", category: "Food Shops" },
  { name: "Symposium", location: "Block-15- Shop No 508", category: "Food Shops", itemsOffered: ["Burger", "Rice", "Pasta", "sandwich", "pizza", "Noodles", "Shakes"] },
  { name: "Dosa Plaza", location: "Block-15- Shop No 603", category: "Food Shops" },
  { name: "Wow Momo", location: "Block-15- Shop No 510.1", category: "Food Shops" },
  // Gym
  { name: "Fitness Edge", location: "Block-15 Level 8", category: "Gym" },
  { name: "Absolute Fit", location: "Block-47-Gym", category: "Gym" },
  // Laundry
  { name: "Mangla Launders", location: "Block-11-GH-3-L1", category: "Laundry" },
  { name: "Washing Basket", location: "Block-13-110-Cubicle No.1", category: "Laundry" },
  { name: "Dhobi Clinic", location: "Block-48-BH-2-Laundry-1", category: "Laundry" },
  // Mess
  { name: "Dhobi Clinic", location: "Block-49-BH-3-Laundry-1", category: "Laundry" },
  { name: "Dhobi Clinic", location: "Block-50-BH-7-Laundry1.1", category: "Laundry" },
  { name: "Dhobi Clinic", location: "Block-51-BH-4-Laundry-1", category: "Laundry" },
  // Mess
  { name: "Bengali Bawarchi", location: "Block-48-BH-2-Cafe", category: "Mess" },
  { name: "NeelKanth", location: "Block-48-BH-2-L1-Mess", category: "Mess" },
  { name: "Sai Mess", location: "Block-9-GH-1-Mess", category: "Mess" },
  { name: "New Fresh Food Mess", location: "Block-11-GH-3-Mess", category: "Mess", itemsOffered: ["Tea", "coffee", "Milk", "samosa", "Momos", "Noodles", "bhatura chole", "Kulcha /Naan/Channa", "Fried rice", "burger", "sandwich", "Honey Chilli Potato", "Chilli Potato", "Puri Chole"] },
  { name: "Bhawani Mess", location: "Block-54-BH-6-Mess-M2", category: "Mess" },
  { name: "Maa Ambay Mess", location: "Block-53-BH-5-Mess-M2", category: "Mess" },
  { name: "Jai Surya Dev Mess", location: "Block-49-BH-3-Mess", category: "Mess" },
  { name: "M/s Anpurna Mess", location: "Block-45-BH-1-Mess", category: "Mess" },
  // Misc
  { name: "Indian Post", location: "Block-41-L1-PostOffice", category: "Post Office" },
  { name: "M/s Geeta Medico", location: "Block-3-L2-Medical", category: "Chemist Shop" },
  { name: "Eyekart", location: "Block-15- Shop No 314", category: "Optical" },
  { name: "HIMALAYA WELLNESS COMPANY", location: "Block-15- Shop No 210-1", category: "Wellness" },
  { name: "Sports Paradise", location: "Block-47- Swimming Pool", category: "Sports" },
  // Photocopiers
  { name: "Sai Copier", location: "Block-27-L1", category: "Photocopier" },
  { name: "Sonia Photocopier", location: "Block-14-L2-Photocopy1", category: "Photocopier" },
  { name: "Behal Traders", location: "Block-20-Photocopy", category: "Photocopier" },
  // Stationery
  { name: "Anil Stationers", location: "Block-28-L1-TuckShop", category: "Stationery" },
  { name: "Ridham Stationery", location: "Block-1-Tuck Shop", category: "Stationery" },
  { name: "Jain Super Store", location: "Block-3-L2-Store", category: "Stationery" },
  // Terrace Cafe
  { name: "Talk of The Town", location: "Block-34-L6-Terrace Cafe", category: "Terrace Cafe" },
  { name: "Govinda's Cafe", location: "Block 26-L5", category: "Terrace Cafe" },
  { name: "Freziller", location: "Block-25-L5-Cafe", category: "Terrace Cafe" },
  // Vending Machine
  { name: "Chai Bar", location: "Block-1-L2-V/M", category: "Vending Machine" },
  { name: "Go Grab", location: "Block-10-GH-2-L1 Vending mchine", category: "Vending Machine" },
  { name: "Go Grab", location: "Block-32-Level-4 (Placement Office)", category: "Vending Machine" }
];
