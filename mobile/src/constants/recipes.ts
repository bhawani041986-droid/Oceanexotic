export interface Recipe {
  id: string;
  title: string;
  fishType: string;
  prepType: 'Curry' | 'Grill' | 'Fry';
  region: 'South Indian' | 'Bengali' | 'Telugu' | 'Andaman Local';
  difficulty: 'Easy' | 'Medium' | 'Expert';
  time: string;
  image: string;
  ingredients: string[];
  steps: string[];
  isDynamic?: boolean;
}

export const RECIPES_DB: Recipe[] = [
  {
    "id": "snapper-bengali",
    "title": "Bengali Shorshe Snapper Curry",
    "fishType": "Red Snapper",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "500g Red Snapper fillets, cut into steaks",
      "3 tbsp Mustard seeds (black and yellow mixed)",
      "1 tbsp Poppy seeds",
      "4 Green chillies, slit",
      "1/2 tsp Turmeric powder",
      "1/2 tsp Kalo jeere (nigella seeds)",
      "4 tbsp Pure mustard oil",
      "Salt to taste",
      "Warm water"
    ],
    "steps": [
      "Soak mustard seeds and poppy seeds in warm water for 10 minutes, then grind with 2 green chillies and a pinch of salt to a smooth paste.",
      "Rub the snapper steaks with turmeric powder and salt. Marinate for 10 minutes.",
      "Heat mustard oil in a heavy pan until it smokes, then lower heat. Lightly shallow fry the fish for 1-2 minutes on each side. Set aside.",
      "In the remaining oil, add kalo jeere and slit green chillies. Saut\u00e9 for 30 seconds.",
      "Add the mustard-poppy paste, turmeric, and 1 cup of warm water. Bring to a gentle boil.",
      "Carefully add the fried fish steaks, cover, and simmer over low heat for 8-10 minutes until fish is cooked.",
      "Drizzle with 1 tsp of raw mustard oil and top with fresh green chillies before turning off the heat."
    ]
  },
  {
    "id": "snapper-south-indian",
    "title": "Kerala Malabar Red Snapper Curry",
    "fishType": "Red Snapper",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Medium",
    "time": "35 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "500g Red Snapper fillets, cubed",
      "1 cup Grated coconut",
      "1/2 tsp Fenugreek seeds",
      "1 tbsp Coriander powder",
      "1.5 tbsp Red chilli powder",
      "2 sprigs Curry leaves",
      "2 Kokum petals (soaked in 1/2 cup warm water)",
      "2 tbsp Coconut oil",
      "Salt to taste"
    ],
    "steps": [
      "Grind grated coconut with a little water to extract thick coconut milk. Grind the residue with fenugreek, coriander, and chilli powder to a smooth paste.",
      "In a clay pot (manchatti), heat coconut oil. Add curry leaves and the ground coconut paste. Saut\u00e9 for 3 minutes.",
      "Pour in 1 cup of water and kokum extract. Bring to a gentle simmer.",
      "Add snapper cubes and salt. Cover and cook on low-medium heat for 12 minutes.",
      "Pour in the thick coconut milk, swirl the pot, and simmer for 2 minutes (do not boil). Garnish with fresh curry leaves."
    ]
  },
  {
    "id": "snapper-telugu",
    "title": "Nellore Snapper Chepala Pulusu",
    "fishType": "Red Snapper",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "500g Red Snapper steaks",
      "1 lemon-sized ball of Tamarind (soaked and pulp extracted)",
      "1 Onion, finely chopped",
      "2 Tomatoes, chopped",
      "2 Green chillies, slit",
      "1/2 tsp Fenugreek seeds",
      "1.5 tbsp Chilli powder",
      "3 tbsp Sesame oil",
      "Salt and fresh coriander"
    ],
    "steps": [
      "Heat sesame oil in a pot. Splutter fenugreek seeds, curry leaves, and green chillies.",
      "Add chopped onions and saut\u00e9 until golden brown. Add tomatoes and cook until mushy.",
      "Stir in chilli powder, turmeric, and tamarind extract. Add 1.5 cups of water and salt. Boil for 10 minutes.",
      "Gently place snapper pieces into the boiling broth. Cover and simmer for 15 minutes.",
      "Rest the curry for 2 hours before serving to let the snapper absorb the tangy juices."
    ]
  },
  {
    "id": "snapper-andaman",
    "title": "Andaman Kokum Red Snapper Curry",
    "fishType": "Red Snapper",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "500g Red Snapper fillets",
      "4 Kokum petals",
      "1 cup Coconut milk",
      "4 Shallots, sliced",
      "2 Green chillies, slit",
      "1 tsp Mustard seeds",
      "1 tbsp Ginger-garlic paste",
      "2 tbsp Coconut oil",
      "Salt & curry leaves"
    ],
    "steps": [
      "Marinate snapper with salt and turmeric for 10 minutes.",
      "Heat coconut oil in a pan. Add mustard seeds, shallots, and ginger-garlic paste. Saut\u00e9 until fragrant.",
      "Pour in 1 cup of water, green chillies, and kokum petals. Bring to a boil.",
      "Slide in the snapper fillets and cook for 8 minutes.",
      "Reduce heat, pour in the coconut milk, and simmer gently for 3 minutes. Serve hot."
    ]
  },
  {
    "id": "snapper-grill",
    "title": "Herb Grilled Whole Snapper",
    "fishType": "Red Snapper",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "35 min",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "ingredients": [
      "1 whole Red Snapper (approx 600g), cleaned and scored",
      "3 tbsp Olive oil",
      "1 tbsp Lemon juice",
      "4 cloves Garlic, minced",
      "1 tbsp fresh rosemary & thyme, chopped",
      "Sea salt and fresh black pepper"
    ],
    "steps": [
      "Clean and pat dry the whole snapper. Make deep diagonal scores on both sides.",
      "Mix olive oil, lemon juice, minced garlic, chopped herbs, sea salt, and pepper.",
      "Rub the herb marinade inside the scores and body cavity. Rest for 20 minutes.",
      "Preheat grill to medium-high. Brush grill grates with oil.",
      "Grill the snapper for 7-8 minutes on each side until charred and the flesh flakes easily. Serve with grilled lemons."
    ]
  },
  {
    "id": "snapper-tawa",
    "title": "South Indian Tawa Masala Snapper",
    "fishType": "Red Snapper",
    "prepType": "Fry",
    "region": "South Indian",
    "difficulty": "Easy",
    "time": "20 min",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
    "ingredients": [
      "500g Red Snapper fillets",
      "2 tbsp Kashmiri red chilli powder",
      "1 tsp Ginger-garlic paste",
      "1/2 tsp Turmeric powder",
      "1/2 tsp Fennel powder",
      "1 tbsp Lemon juice",
      "2 sprigs Curry leaves, finely chopped",
      "3 tbsp Coconut oil for shallow frying",
      "Salt to taste"
    ],
    "steps": [
      "Make a thick marinade paste by mixing chilli powder, ginger-garlic paste, turmeric, fennel powder, lemon juice, salt, and chopped curry leaves with a few drops of water.",
      "Coat the snapper fillets evenly with the masala paste. Marinate for 20-30 minutes.",
      "Heat coconut oil on a flat tawa or griddle over medium heat.",
      "Place marinated fillets on the hot griddle and fry undisturbed for 4-5 minutes until the base forms a crispy crust.",
      "Gently flip the fish and fry the other side for another 4 minutes, basting with a little extra coconut oil if needed.",
      "Serve hot garnished with onion rings and lemon wedges."
    ]
  },
  {
    "id": "kingfish-bengali",
    "title": "Bengali Doi Maach Kingfish",
    "fishType": "Kingfish",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "500g Kingfish steaks",
      "1/2 cup Hung curd (whisked)",
      "1 tbsp Ginger paste",
      "1 tsp Onion paste",
      "3 Cardamoms, 3 Cloves, 1 Cinnamon stick",
      "1/2 tsp Turmeric & 1 tsp Kashmiri red chilli powder",
      "2 tbsp Ghee & 1 tbsp Mustard oil",
      "Salt to taste"
    ],
    "steps": [
      "Marinate kingfish steaks with salt and turmeric. Shallow fry in mustard oil for 2 minutes; set aside.",
      "In the same pan, add ghee. Temper with cardamom, cloves, and cinnamon.",
      "Add ginger and onion paste. Saut\u00e9 for 2 minutes. Lower heat and stir in whisked yogurt.",
      "Add chilli powder, turmeric, and 1/2 cup of warm water. Bring to a simmer.",
      "Add kingfish. Cover and cook on low heat for 10 minutes until gravy is thick."
    ]
  },
  {
    "id": "kingfish-south-indian",
    "title": "Kerala Coconut Kingfish Curry",
    "fishType": "Kingfish",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "500g Kingfish steaks",
      "1 cup Freshly grated coconut",
      "4 Shallots",
      "1/2 tsp Fenugreek seeds",
      "1.5 tbsp Chilli powder",
      "2 Kokum petals",
      "2 tbsp Coconut oil",
      "Curry leaves & salt"
    ],
    "steps": [
      "Grind grated coconut, shallots, and fenugreek to a smooth paste with a little water.",
      "Heat coconut oil in a clay pot. Add curry leaves and the ground paste. Saut\u00e9 for 2 minutes.",
      "Add chilli powder, turmeric, and 1.5 cups of water along with kokum extract.",
      "Bring to a boil, then slide in the kingfish steaks. Add salt.",
      "Simmer covered for 12-15 minutes until fish is cooked. Drizzle raw coconut oil on top."
    ]
  },
  {
    "id": "kingfish-telugu",
    "title": "Telugu Chepala Pulusu",
    "fishType": "Kingfish",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "600g Kingfish steaks",
      "1 tamarind ball (soaked and juice extracted)",
      "2 onions, finely chopped",
      "2 tomatoes, pureed",
      "3 green chillies, slit",
      "1 tsp mustard seeds & 1/4 tsp fenugreek",
      "1 tbsp ginger-garlic paste",
      "2 tbsp chilli powder & 1 tsp coriander powder",
      "3 tbsp sesame oil",
      "Salt & curry leaves"
    ],
    "steps": [
      "Rub kingfish steaks with a little salt, turmeric, and 1 tsp of chilli powder. Keep aside.",
      "Heat sesame oil. Add mustard and fenugreek seeds, allowing them to crackle.",
      "Add curry leaves, chopped onions, and slit green chillies. Saut\u00e9 until onions are golden brown.",
      "Stir in ginger-garlic paste and tomato puree. Saut\u00e9 until oil separates.",
      "Pour in tamarind juice and 1.5 cups of water. Season with salt and boil for 10 minutes.",
      "Gently slide in kingfish steaks. Simmer on low heat for 12 minutes. Rest before serving."
    ]
  },
  {
    "id": "kingfish-andaman",
    "title": "Andaman Coconut Kingfish Curry",
    "fishType": "Kingfish",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "500g Kingfish steaks",
      "1 cup fresh coconut milk",
      "4 dried Kokum petals",
      "1 Onion, sliced",
      "2 Green chillies",
      "1 tsp Mustard seeds",
      "2 tbsp Coconut oil",
      "Curry leaves & salt"
    ],
    "steps": [
      "Marinate kingfish steaks with turmeric and salt.",
      "Heat coconut oil. Add mustard seeds, curry leaves, and sliced onions. Saut\u00e9 until soft.",
      "Pour in 1 cup of water and soaked kokum extract. Bring to a boil.",
      "Add kingfish pieces. Simmer for 8 minutes.",
      "Stir in coconut milk. Lower heat and cook gently for 4 minutes. Rest covered."
    ]
  },
  {
    "id": "kingfish-grill",
    "title": "Port Blair Fleet Grilled Kingfish",
    "fishType": "Kingfish",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "35 min",
    "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800",
    "ingredients": [
      "2 large Kingfish steaks (1-inch thick)",
      "1 tbsp Port Blair fleet spice blend (black pepper, coriander, fennel, dry mango)",
      "1 tbsp Lemon juice",
      "1 tsp Garlic paste",
      "2 tbsp Butter, melted",
      "1/2 tsp Sea salt",
      "Fresh dill sprigs"
    ],
    "steps": [
      "Wash and pat dry the kingfish steaks completely.",
      "Combine the fleet spice blend, garlic paste, lemon juice, and sea salt with 1 tbsp of melted butter.",
      "Apply the spice paste thoroughly on both sides of the steaks. Rest for 15 minutes.",
      "Preheat your grill or cast iron grill pan to medium-high heat. Lightly brush with butter.",
      "Grill the steaks for 5 minutes on the first side to get clean sear marks. Flip carefully.",
      "Baste the grilled side with the remaining butter. Grill the second side for another 4-5 minutes until the fish flakes easily.",
      "Serve immediately garnished with fresh dill and grilled lemon quarters."
    ]
  },
  {
    "id": "kingfish-fry",
    "title": "Tawa Fried Kingfish Steaks",
    "fishType": "Kingfish",
    "prepType": "Fry",
    "region": "South Indian",
    "difficulty": "Easy",
    "time": "20 min",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
    "ingredients": [
      "500g Kingfish steaks",
      "1.5 tbsp Red chilli powder",
      "1 tsp Ginger-garlic paste",
      "1/2 tsp Turmeric & fennel powder",
      "1 tbsp Lemon juice",
      "3 tbsp Coconut oil",
      "Salt & curry leaves"
    ],
    "steps": [
      "Mix chilli powder, ginger-garlic paste, turmeric, fennel, lemon juice, and salt with a little water to form a paste.",
      "Coat the kingfish steaks thoroughly with the marinade. Rest for 20 minutes.",
      "Heat coconut oil on a tawa. Add a few curry leaves to the oil.",
      "Shallow fry the steaks on medium heat for 5 minutes on each side until crispy and golden. Serve hot."
    ]
  },
  {
    "id": "pomfret-bengali",
    "title": "Bengali Pomfret Shorshe Jhal",
    "fishType": "White Pomfret",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "2 White Pomfrets (cleaned and scored)",
      "3 tbsp Black and yellow mustard seeds paste",
      "3 Green chillies",
      "1/2 tsp Turmeric",
      "1/2 tsp Kalo jeere (nigella seeds)",
      "4 tbsp Mustard oil",
      "Salt & fresh coriander"
    ],
    "steps": [
      "Rub pomfrets with turmeric and salt. Lightly fry in mustard oil for 1 minute on each side. Set aside.",
      "In the same oil, add nigella seeds and green chillies. Saut\u00e9 for 30 seconds.",
      "Stir in the mustard paste, turmeric, salt, and 1 cup of warm water.",
      "Gently slide in the whole pomfrets. Cover and cook on low heat for 8-10 minutes.",
      "Drizzle with raw mustard oil and garnish with coriander before serving."
    ]
  },
  {
    "id": "pomfret-malabari",
    "title": "Malabari Coconut Pomfret",
    "fishType": "White Pomfret",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "1 Whole White Pomfret, cleaned and slit on sides",
      "1 cup Freshly grated coconut",
      "4 Shallots (small onions)",
      "2 cloves Garlic",
      "1/2 tsp Fennel seeds",
      "2 Kokum petals (soaked in warm water)",
      "1 tsp Turmeric powder & 1 tbsp Red chilli powder",
      "2 sprigs Curry leaves",
      "2 tbsp Coconut oil",
      "Salt to taste"
    ],
    "steps": [
      "Grind the grated coconut, shallots, garlic, fennel seeds, and turmeric powder to a very smooth, fine paste.",
      "Heat coconut oil in a clay pot. Add curry leaves and the ground coconut paste. Saut\u00e9 on medium-low heat for 3 minutes.",
      "Add red chilli powder and saut\u00e9 for another minute. Pour in 1.5 cups of water and the kokum petals along with their soaking water.",
      "Add salt, bring to a gentle boil, and simmer for 5 minutes.",
      "Gently place the whole pomfret into the simmering coconut gravy. Ensure it is submerged.",
      "Cover and cook on low heat for 10-12 minutes, turning the fish once halfway through very gently.",
      "Drizzle raw coconut oil on top, close the lid, and turn off heat. Let it stand for 5 minutes."
    ]
  },
  {
    "id": "pomfret-telugu",
    "title": "Andhra Pomfret Chepala Pulusu",
    "fishType": "White Pomfret",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Expert",
    "time": "35 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "2 whole White Pomfrets, cleaned and scored",
      "1 cup Tamarind extract",
      "1 Onion, chopped",
      "1 Tomato, chopped",
      "2 green chillies, slit",
      "1/2 tsp Mustard & fenugreek seeds",
      "2 tsp Red chilli powder",
      "3 tbsp Sesame oil & salt"
    ],
    "steps": [
      "Heat sesame oil in a pot. Splutter mustard, fenugreek, and curry leaves.",
      "Add chopped onions, green chillies, and ginger-garlic paste. Saut\u00e9 until golden.",
      "Add tomatoes and cook until soft. Add chilli powder, turmeric, and tamarind extract with 1.5 cups of water.",
      "Simmer for 5 minutes, then add the whole pomfrets. Cover and cook on low for 12 minutes. Serve hot."
    ]
  },
  {
    "id": "pomfret-andaman",
    "title": "Andaman Kokum Pomfret Curry",
    "fishType": "White Pomfret",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "2 Whole Pomfrets, cleaned and scored",
      "4 dried Kokum petals",
      "1 cup Coconut milk",
      "4 Shallots, sliced",
      "1 tsp Mustard seeds",
      "2 tbsp Coconut oil",
      "Salt & fresh curry leaves"
    ],
    "steps": [
      "Heat coconut oil. Saut\u00e9 mustard seeds, curry leaves, and sliced shallots until golden.",
      "Pour in 1 cup of water, green chillies, and kokum extract. Bring to a boil.",
      "Slide in the pomfrets and cook for 8 minutes, flipping once gently.",
      "Stir in the coconut milk. Simmer on low heat for 3-4 minutes. Rest and serve."
    ]
  },
  {
    "id": "pomfret-grill",
    "title": "Tandoori Whole Grilled Pomfret",
    "fishType": "White Pomfret",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "ingredients": [
      "1 large Whole White Pomfret, cleaned and deeply scored",
      "3 tbsp Thick yogurt",
      "1 tbsp Mustard oil",
      "1 tbsp Ginger-garlic paste",
      "1.5 tbsp Tandoori masala & chilli powder",
      "1 tbsp Lemon juice",
      "Salt to taste"
    ],
    "steps": [
      "Rub the pomfret with lemon juice and salt. Rest for 10 minutes.",
      "Whisk yogurt, mustard oil, ginger-garlic paste, tandoori masala, and chilli powder into a paste.",
      "Coat the whole pomfret generously with the yogurt paste, filling the scores. Marinate for 1 hour.",
      "Grill or bake at 200\u00b0C for 12 minutes on the first side. Baste with butter, flip, and grill for 10 minutes until charred."
    ]
  },
  {
    "id": "pomfret-rava",
    "title": "Crispy Rava Fried Pomfret",
    "fishType": "White Pomfret",
    "prepType": "Fry",
    "region": "South Indian",
    "difficulty": "Easy",
    "time": "20 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "2 Medium White Pomfrets, cleaned and slit",
      "1.5 tbsp Goan fish recheado masala (or red chilli paste + vinegar)",
      "1/2 tsp Turmeric powder & 1/2 tsp Ginger-garlic paste",
      "1/2 cup Semolina (rava)",
      "2 tbsp Rice flour",
      "Oil for shallow frying",
      "Salt to taste"
    ],
    "steps": [
      "Mix red chilli paste/recheado masala, turmeric, ginger-garlic paste, and salt with a squeeze of lemon.",
      "Apply this spicy marinade thoroughly over the pomfrets, forcing some into the side slits and body cavity. Marinate for 20 minutes.",
      "Mix semolina (rava) and rice flour on a flat plate with a pinch of salt.",
      "Dredge the marinated pomfrets in the semolina mix, pressing firmly to coat evenly on all sides.",
      "Heat oil in a frying pan over medium heat. Shallow fry the pomfrets for 5-6 minutes on each side until golden brown and super crispy.",
      "Drain on kitchen towels and serve hot with green chutney."
    ]
  },
  {
    "id": "grouper-jhol",
    "title": "Bengali Grouper Macher Jhol",
    "fishType": "Grouper",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Medium",
    "time": "35 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "500g Grouper fillets, cut into large cubes",
      "1 large Potato, cut into wedges",
      "1 Eggplant (small), cut into thick wedges",
      "1 tsp Panch Phoron (Bengali five-spice)",
      "1 tsp Cumin paste & 1 tsp Ginger paste",
      "1 tsp Turmeric powder & 1 tsp Red chilli powder",
      "3 Green chillies, slit",
      "3 tbsp Mustard oil",
      "Fresh coriander leaves",
      "Salt to taste"
    ],
    "steps": [
      "Marinate grouper cubes with turmeric and salt. Heat mustard oil in a pan and lightly fry the fish until golden. Set aside.",
      "In the same oil, fry potato and eggplant wedges until lightly browned. Remove and set aside.",
      "Temper the remaining hot oil with panch phoron and slit green chillies.",
      "Add cumin paste, ginger paste, turmeric, and chilli powder mixed with 2 tbsp of water. Saut\u00e9 spice paste for 2 minutes until oil separates.",
      "Add 2 cups of warm water, fried potatoes, and eggplant. Season with salt and bring to a boil. Cook for 8 minutes until potatoes are semi-soft.",
      "Add fried grouper pieces and simmer covered on medium-low for 8-10 minutes.",
      "Garnish with chopped coriander and serve hot with steamed Basmati rice."
    ]
  },
  {
    "id": "grouper-south-indian",
    "title": "Kerala Coconut Grouper Curry",
    "fishType": "Grouper",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "500g Grouper steaks",
      "1 cup fresh coconut milk",
      "1/2 tsp fenugreek seeds",
      "4 shallots, sliced",
      "2 green chillies, slit",
      "1 tbsp ginger-garlic paste",
      "2 tbsp coconut oil & curry leaves",
      "1.5 tbsp chilli powder & salt"
    ],
    "steps": [
      "Heat coconut oil in a clay pot. Saut\u00e9 fenugreek seeds, curry leaves, shallots, and ginger-garlic paste.",
      "Add chilli powder, turmeric, and 1 cup of water. Bring to a simmer.",
      "Slide in the grouper pieces. Season with salt. Cover and cook on medium-low for 10 minutes.",
      "Stir in the coconut milk. Lower heat and cook gently for 3 minutes. Serve hot."
    ]
  },
  {
    "id": "grouper-telugu",
    "title": "Nellore Grouper Chepala Pulusu",
    "fishType": "Grouper",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "500g Grouper steaks",
      "1 tamarind ball (extracted)",
      "1 onion, chopped & 2 green chillies",
      "2 tomatoes, chopped",
      "1 tbsp ginger-garlic paste",
      "1/2 tsp mustard & fenugreek seeds",
      "2 tsp Red chilli powder",
      "3 tbsp sesame oil & salt"
    ],
    "steps": [
      "Heat sesame oil in a pot. Splutter mustard, fenugreek, and curry leaves.",
      "Add chopped onions, green chillies, and ginger-garlic paste. Saut\u00e9 until golden.",
      "Add tomatoes and cook until soft. Add chilli powder, turmeric, and tamarind extract with 1.5 cups of water.",
      "Simmer for 5 minutes, then add the grouper pieces. Cover and cook on low for 12 minutes. Serve hot."
    ]
  },
  {
    "id": "andaman-kokum-curry",
    "title": "Andaman Kokum & Coconut Fish Curry",
    "fishType": "Grouper",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "500g Grouper steaks",
      "1 cup Fresh coconut milk (thick)",
      "4 dried Kokum petals (soaked in warm water)",
      "1 Onion, finely sliced",
      "2 Green chillies, slit",
      "1 tsp Mustard seeds & 1/2 tsp Turmeric",
      "1 tbsp Ginger-garlic paste",
      "Curry leaves",
      "2 tbsp Coconut oil",
      "Salt to taste"
    ],
    "steps": [
      "Wash and dry grouper steaks, marinate with turmeric and salt.",
      "Heat coconut oil in a traditional clay pot. Add mustard seeds and curry leaves.",
      "Add green chillies, onions, and ginger-garlic paste. Saut\u00e9 until onions are translucent.",
      "Pour in 1 cup of warm water, the soaked kokum petals, and their soaking juice. Bring to a boil.",
      "Slide in the grouper pieces and cook for 6 minutes.",
      "Pour in the thick fresh coconut milk, lower the heat, and simmer gently for 5 minutes (do not boil after adding thick coconut milk).",
      "Rest for 10 minutes covered before serving."
    ]
  },
  {
    "id": "grouper-tandoori",
    "title": "Tandoori Grilled Sea Grouper",
    "fishType": "Grouper",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "45 min",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "ingredients": [
      "1 whole Sea Grouper (cleaned, scaled, gills removed, deeply scored)",
      "3 tbsp Thick hung curd (Greek yogurt)",
      "1 tbsp Mustard oil",
      "1 tbsp Ginger-garlic paste",
      "1.5 tbsp Kashmiri chilli powder",
      "1 tsp Kasuri methi (dried fenugreek leaves, crushed)",
      "1/2 tsp Garam masala powder & 1/2 tsp Chaat masala",
      "1 tbsp Lemon juice",
      "Salt to taste"
    ],
    "steps": [
      "First marinate the grouper with lemon juice, salt, and 1 tsp of red chilli powder. Rub inside scores and rest for 15 minutes.",
      "For the second marinade, whisk hung curd, mustard oil, ginger-garlic paste, remaining red chilli powder, garam masala, kasuri methi, and salt to a thick paste.",
      "Slather the yogurt marinade all over the fish, ensuring it goes deep into the slits. Marinate in the fridge for at least 1 hour.",
      "Preheat your oven or charcoal grill to 200\u00b0C (390\u00b0F).",
      "Place the grouper on a greased wire rack or grill grate. Grill/bake for 15 minutes.",
      "Baste generously with butter or oil, flip, and grill for another 12-15 minutes until charred at the edges and cooked inside.",
      "Dust with chaat masala and serve with mint chutney."
    ]
  },
  {
    "id": "grouper-fry",
    "title": "Masala Fried Grouper Steaks",
    "fishType": "Grouper",
    "prepType": "Fry",
    "region": "South Indian",
    "difficulty": "Easy",
    "time": "20 min",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
    "ingredients": [
      "500g Grouper fillets",
      "1.5 tbsp Red chilli powder & 1/2 tsp turmeric",
      "1 tsp Ginger-garlic paste & lemon juice",
      "3 tbsp Coconut oil & salt"
    ],
    "steps": [
      "Mix chilli powder, ginger-garlic paste, turmeric, lemon juice, and salt with a little water to form a paste.",
      "Coat the grouper fillets with the paste. Marinate for 20 minutes.",
      "Heat coconut oil in a pan over medium heat.",
      "Shallow fry the fillets for 5 minutes on each side until cooked and crispy. Serve hot."
    ]
  },
  {
    "id": "mackerel-bengali",
    "title": "Bengali Mackerel Bhapa",
    "fishType": "Mackerel",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "4 whole Mackerels, cleaned",
      "3 tbsp Mustard seed paste",
      "2 tbsp Grated coconut paste",
      "4 green chillies",
      "1 tsp Turmeric",
      "2 tbsp Mustard oil & salt"
    ],
    "steps": [
      "Marinate mackerels with turmeric and salt.",
      "In a steel tiffin box, mix mustard paste, coconut paste, mustard oil, slit green chillies, and salt.",
      "Coat the mackerels with this paste. Close the box lid.",
      "Place the box inside a steamer or pressure cooker with water. Steam for 15 minutes.",
      "Drizzle a little raw mustard oil on top before serving."
    ]
  },
  {
    "id": "mackerel-south-indian",
    "title": "Kerala Malabar Mackerel Curry",
    "fishType": "Mackerel",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "4 Mackerels, cleaned",
      "4 shallots, chopped & ginger-garlic paste",
      "2 Kokum petals",
      "1.5 tbsp chilli powder & 1/2 tsp turmeric",
      "2 tbsp coconut oil & curry leaves"
    ],
    "steps": [
      "Heat coconut oil. Saut\u00e9 curry leaves, shallots, and ginger-garlic paste.",
      "Add chilli powder, turmeric, and 1.5 cups of water along with kokum extract.",
      "Bring to a boil, then add the mackerels. Cover and simmer for 12 minutes.",
      "Swirl the pot, drizzle coconut oil, and serve."
    ]
  },
  {
    "id": "mackerel-telugu",
    "title": "Telugu Mackerel Tamarind Curry",
    "fishType": "Mackerel",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "4 Mackerels, cut into halves",
      "1 cup Tamarind extract (tangy concentration)",
      "1 Onion, sliced & 2 Green chillies",
      "1 tbsp Ginger-garlic paste",
      "1 tsp Mustard seeds & 1/4 tsp Fenugreek seeds",
      "2 tsp Red chilli powder & 1 tsp Coriander powder",
      "Curry leaves",
      "2 tbsp Oil & salt"
    ],
    "steps": [
      "Clean mackerel pieces and marinate with turmeric and a pinch of salt.",
      "Heat oil in a cooking pot. Splutter mustard and fenugreek seeds. Add curry leaves, green chillies, and sliced onions. Saut\u00e9 till translucent.",
      "Add ginger-garlic paste and cook for 1 minute. Add red chilli powder, coriander powder, and salt.",
      "Pour in the tamarind extract along with 1 cup of water. Cover and boil for 7 minutes.",
      "Gently add the mackerel pieces. Simmer on low heat for 10 minutes until the fish is cooked and the curry thickens.",
      "Serve hot with steamed rice."
    ]
  },
  {
    "id": "mackerel-andaman",
    "title": "Andaman Coconut Mackerel Curry",
    "fishType": "Mackerel",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "4 Mackerels, cleaned",
      "1 cup fresh coconut milk",
      "4 dried Kokum petals",
      "1 Onion, sliced & 2 green chillies",
      "2 tbsp coconut oil & curry leaves"
    ],
    "steps": [
      "Heat coconut oil. Saut\u00e9 curry leaves and onions.",
      "Pour in 1 cup of water and kokum extract. Bring to a boil.",
      "Add the mackerels. Cover and simmer for 8 minutes.",
      "Add coconut milk, simmer on low for 4 minutes. Garnish with curry leaves."
    ]
  },
  {
    "id": "mackerel-grill",
    "title": "Spicy Grilled Whole Mackerel",
    "fishType": "Mackerel",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "ingredients": [
      "3 Whole Mackerels, cleaned and stuffed",
      "1 tbsp Chilli powder & 1 tsp garlic paste",
      "1 Onion & 1 green chilli, chopped",
      "1 tbsp Lemon juice & olive oil"
    ],
    "steps": [
      "Clean and butterfly cut the mackerels.",
      "Mix chopped onions, green chillies, garlic paste, lemon juice, and chilli powder.",
      "Stuff the mackerel body cavity with the mixture.",
      "Brush outside with olive oil. Grill for 6 minutes on each side until charred. Serve hot."
    ]
  },
  {
    "id": "mackerel-recheado",
    "title": "Goan Mackerel Recheado Fry",
    "fishType": "Mackerel",
    "prepType": "Fry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
    "ingredients": [
      "3 whole Mackerels, cleaned and slit deep along the spine on both sides of the bone",
      "3 tbsp Goan Recheado paste (dry red chillies ground with vinegar, garlic, ginger, cloves, cinnamon, and cumin)",
      "1/2 cup Fine rava (semolina)",
      "3 tbsp Oil for frying",
      "Lemon wedges & salt"
    ],
    "steps": [
      "Wash mackerels and dry them completely. Rub with salt inside and out.",
      "Stuff the deep spinal slits generously with Goan Recheado paste.",
      "Lightly coat the outside of the fish with a thin layer of the paste, then roll in semolina to coat.",
      "Heat oil in a shallow frying pan over medium heat.",
      "Fry the stuffed mackerels for 6 minutes on each side, turning carefully, until the outer crust is crispy and brown.",
      "Serve hot as a side dish with rice and fish curry."
    ]
  },
  {
    "id": "prawns-malai",
    "title": "Bengali Chingri Malai Curry",
    "fishType": "Tiger Prawns",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?q=80&w=800",
    "ingredients": [
      "400g Tiger Prawns (cleaned, deveined, tails left on)",
      "1.5 cups Fresh coconut milk (thick)",
      "1 tbsp Ginger paste",
      "1 tsp Onion paste",
      "1/2 tsp Turmeric powder & 1 tsp Red chilli powder",
      "1/2 tsp Garam masala powder",
      "3 Whole green cardamoms, 1-inch cinnamon, 3 cloves",
      "2 tbsp Ghee & 1 tbsp Mustard oil",
      "Salt to taste"
    ],
    "steps": [
      "Smear prawns with a pinch of turmeric and salt. Lightly saut\u00e9 in mustard oil for 1 minute until they turn pink. Do not overcook. Set aside.",
      "Add ghee to the pan. Temper with whole cardamoms, cinnamon, and cloves.",
      "Stir in the onion paste and ginger paste. Cook for 2 minutes until raw smell goes away.",
      "Add turmeric, red chilli powder, and salt. Pour in half of the coconut milk and cook the spices for 3 minutes.",
      "Add the rest of the coconut milk and bring to a simmer. Add green chillies.",
      "Gently slide in the prawns and simmer on low for 5-6 minutes until the gravy is rich and creamy.",
      "Finish with garam masala, let it rest for 2 minutes, and serve with pilaf or rice."
    ]
  },
  {
    "id": "prawns-south-indian",
    "title": "Kerala Coconut Prawn Curry",
    "fishType": "Tiger Prawns",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "400g Tiger Prawns, deveined",
      "1 cup fresh coconut milk",
      "1/2 tsp turmeric & 1 tbsp chilli powder",
      "2 sprigs Curry leaves",
      "2 tbsp coconut oil & salt"
    ],
    "steps": [
      "Heat coconut oil. Saut\u00e9 curry leaves and onions.",
      "Add chilli powder, turmeric, ginger-garlic, and 1/2 cup of water. Saut\u00e9 for 2 minutes.",
      "Add prawns. Cook for 3 minutes.",
      "Pour in coconut milk, simmer on low heat for 4 minutes. Garnish and serve."
    ]
  },
  {
    "id": "prawns-telugu",
    "title": "Andhra Royyala Spicy Kura",
    "fishType": "Tiger Prawns",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Medium",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "400g Prawns, deveined",
      "1 Onion, finely chopped",
      "1 Tomato, pureed",
      "1 tbsp Ginger-garlic paste",
      "1.5 tbsp Red chilli powder & 1 tsp Garam masala",
      "3 tbsp oil & salt"
    ],
    "steps": [
      "Heat oil. Saut\u00e9 onions and ginger-garlic paste until brown.",
      "Add tomato puree, chilli powder, coriander powder, and salt. Saut\u00e9 until oil separates.",
      "Add prawns and cook for 5 minutes.",
      "Add garam masala and 1/2 cup of water. Simmer covered for 6 minutes until gravy is thick. Garnish with coriander."
    ]
  },
  {
    "id": "prawns-andaman",
    "title": "Andaman Coconut Prawn Curry",
    "fishType": "Tiger Prawns",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Medium",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "400g Tiger Prawns",
      "1 cup fresh coconut milk",
      "4 dried Kokum petals",
      "4 Shallots, sliced",
      "2 tbsp coconut oil & curry leaves"
    ],
    "steps": [
      "Heat coconut oil. Saut\u00e9 curry leaves and shallots.",
      "Add kokum extract, slit green chillies, and 1/2 cup of water. Saut\u00e9 for 2 minutes.",
      "Add prawns. Cook for 3 minutes.",
      "Pour in coconut milk, simmer on low heat for 4 minutes. Garnish and serve."
    ]
  },
  {
    "id": "prawns-tandoori",
    "title": "Tandoori Garlic Tiger Prawns",
    "fishType": "Tiger Prawns",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Easy",
    "time": "20 min",
    "image": "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?q=80&w=800",
    "ingredients": [
      "500g Jumbo Tiger Prawns, shell removed, deveined",
      "1.5 tbsp Butter, melted",
      "1 tbsp Lemon juice",
      "1 tbsp Ginger-garlic paste & 1 tbsp chopped garlic",
      "1 tsp Black pepper powder & 1/2 tsp Oregano",
      "Chilli flakes & sea salt"
    ],
    "steps": [
      "Marinate cleaned prawns in garlic paste, lemon juice, pepper, and sea salt. Rest for 10 minutes.",
      "Preheat a grill pan or outdoor grill. Mix chopped garlic, butter, and oregano.",
      "Thread prawns onto skewers.",
      "Grill prawns over high heat for 2-3 minutes per side, brushing continuously with the garlic butter mix.",
      "Once prawns are opaque and charred at the edges, transfer to a platter.",
      "Squeeze fresh lemon, garnish with chilli flakes, and serve immediately."
    ]
  },
  {
    "id": "havelock-tawa-prawns",
    "title": "Havelock Island Tawa Prawn Roast",
    "fishType": "Tiger Prawns",
    "prepType": "Fry",
    "region": "Andaman Local",
    "difficulty": "Easy",
    "time": "20 min",
    "image": "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?q=80&w=800",
    "ingredients": [
      "400g Tiger Prawns, peeled and deveined",
      "1.5 tbsp Freshly crushed black pepper",
      "6 Shallots (small onions), sliced",
      "1 Tomato, chopped",
      "1 tbsp Ginger-garlic paste",
      "1/2 tsp Cumin powder & 1/2 tsp Turmeric",
      "Curry leaves & coriander",
      "2 tbsp Coconut oil",
      "Juice of 1/2 lime",
      "Salt to taste"
    ],
    "steps": [
      "Marinate prawns with ginger-garlic paste, turmeric, lime juice, and a pinch of salt.",
      "Heat coconut oil on a heavy iron griddle/tawa. Fry sliced shallots and curry leaves till caramelized.",
      "Add chopped tomatoes and cook until soft and mushy.",
      "Add marinated prawns and toss over high heat for 4 minutes until they turn pink.",
      "Sprinkle the freshly crushed black pepper and cumin powder. Toss vigorously on the tawa for 2-3 minutes to dry roast.",
      "Garnish with fresh coriander and serve hot directly from the tawa."
    ]
  },
  {
    "id": "crab-bengali",
    "title": "Bengali Kakra Jhal Masala",
    "fishType": "Mud Crab",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1553618551-fba68c8b4df7?q=80&w=800",
    "ingredients": [
      "2 Mud Crabs, cleaned and cut",
      "1 large Potato, cubed",
      "1.5 tbsp Onion-ginger-garlic paste",
      "2 Tomatoes, chopped",
      "1 tsp Garam masala & ghee",
      "1 tsp Turmeric & red chilli powder",
      "3 tbsp Mustard oil & salt"
    ],
    "steps": [
      "Marinate crab pieces with turmeric and salt. Saut\u00e9 in mustard oil for 3 minutes; set aside. Saut\u00e9 potatoes until golden.",
      "In the same oil, add cardamoms and cloves. Add onion-ginger-garlic paste and tomatoes. Saut\u00e9 until oil separates.",
      "Add chilli powder, turmeric, and 2 cups of water.",
      "Add crabs and potatoes. Cover and cook on medium for 18-20 minutes.",
      "Finish with garam masala and ghee. Serve hot."
    ]
  },
  {
    "id": "crab-south-indian",
    "title": "Kerala Roasted Coconut Crab",
    "fishType": "Mud Crab",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Expert",
    "time": "45 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "2 Mud Crabs, cut into halves",
      "1 cup fresh grated coconut",
      "4 Shallots & 2 cloves garlic",
      "1/2 tsp fennel seeds",
      "1.5 tbsp Chilli powder",
      "3 tbsp Coconut oil & curry leaves"
    ],
    "steps": [
      "Dry roast coconut, shallots, garlic, and fennel seeds in a pan until dark golden brown. Grind to a thick paste.",
      "Heat coconut oil. Saut\u00e9 curry leaves and onions. Add crab pieces and ground paste.",
      "Add 2 cups of water and salt. Cover and simmer for 20-25 minutes until crab meat is cooked and gravy is thick."
    ]
  },
  {
    "id": "crab-telugu",
    "title": "Andhra Spicy Crab Pulusu",
    "fishType": "Mud Crab",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "2 Mud Crabs, cut",
      "1 cup Tamarind pulp",
      "1 Onion, chopped",
      "1 Tomato, pureed",
      "1.5 tbsp Chilli powder",
      "1/2 tsp Mustard & fenugreek seeds",
      "3 tbsp oil & salt"
    ],
    "steps": [
      "Heat oil. Splutter mustard and fenugreek seeds.",
      "Add onions, ginger-garlic, and tomato. Saut\u00e9 until soft.",
      "Stir in chilli powder, tamarind extract, and 1.5 cups of water.",
      "Add crab pieces and salt. Cover and simmer for 20 minutes until gravy thickens. Garnish with curry leaves."
    ]
  },
  {
    "id": "crab-andaman",
    "title": "Andaman Maritime Crab Curry",
    "fishType": "Mud Crab",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "45 min",
    "image": "https://images.unsplash.com/photo-1553618551-fba68c8b4df7?q=80&w=800",
    "ingredients": [
      "2 Mud Crabs, cleaned and cut",
      "1 cup Fresh coconut paste (ground with 2 dry chillies)",
      "1 Onion, chopped",
      "1 Tomato, chopped",
      "1 tbsp Ginger-garlic paste",
      "1 tbsp local Maritime fleet curry powder",
      "1 tsp Tamarind pulp",
      "Curry leaves",
      "3 tbsp Oil & salt"
    ],
    "steps": [
      "Heat oil in a deep cooking pot. Add curry leaves and onions, fry till soft.",
      "Add ginger-garlic paste and chopped tomatoes. Cook till tomatoes are mushy.",
      "Add the local curry powder and ground coconut paste. Fry spices for 3 minutes.",
      "Add the crab pieces and mix to combine. Pour in 2 cups of water and salt.",
      "Cover and cook on medium heat for 20 minutes until the crab meat is cooked and gravy is thick.",
      "Stir in the tamarind pulp and simmer for 2 minutes. Serve hot."
    ]
  },
  {
    "id": "crab-grill",
    "title": "Garlic Butter Grilled Crab",
    "fishType": "Mud Crab",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "ingredients": [
      "2 Mud Crabs, cleaned and split",
      "4 tbsp Butter, melted",
      "4 cloves Garlic, minced",
      "1 tsp Chilli flakes & lemon juice",
      "Sea salt to taste"
    ],
    "steps": [
      "Clean crabs and crack claws lightly.",
      "Mix melted butter, minced garlic, lemon juice, and chilli flakes.",
      "Coat crabs with the garlic butter.",
      "Grill over charcoal or a griddle for 12-15 minutes, basting with garlic butter frequently. Serve hot."
    ]
  },
  {
    "id": "crab-pepper",
    "title": "South Indian Crab Pepper Fry",
    "fishType": "Mud Crab",
    "prepType": "Fry",
    "region": "South Indian",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1553618551-fba68c8b4df7?q=80&w=800",
    "ingredients": [
      "2 Mud Crabs, cleaned, cracked, cut into halves",
      "1.5 tbsp Freshly crushed black peppercorns",
      "1 Onion, finely chopped",
      "1 tsp Ginger-garlic paste",
      "1/2 tsp Mustard seeds & 1/2 tsp Cumin seeds",
      "1 tsp Coriander powder & 1/2 tsp Turmeric",
      "2 sprigs Curry leaves",
      "2 tbsp Coconut oil",
      "Salt to taste"
    ],
    "steps": [
      "Boil the cleaned crabs in water with turmeric and salt for 5 minutes until they turn red. Drain and set aside.",
      "Heat coconut oil in a pan. Add mustard seeds, cumin seeds, and curry leaves. Let them crackle.",
      "Add onions and ginger-garlic paste. Saut\u00e9 until deep golden brown.",
      "Add coriander powder, a pinch of turmeric, and the boiled crab pieces. Stir fry to coat the crabs with the onion base.",
      "Add the crushed black pepper and salt. Toss over high heat for 6-8 minutes until dry and aromatic.",
      "Serve dry as an appetizer or side dish."
    ]
  },
  {
    "id": "lobster-bengali",
    "title": "Bengali Golda Chingri Kalia",
    "fishType": "Spiny Lobster",
    "prepType": "Curry",
    "region": "Bengali",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1553618551-fba68c8b4df7?q=80&w=800",
    "ingredients": [
      "2 Spiny Lobster tails, split",
      "1 Onion, pureed",
      "1 tbsp Ginger-garlic paste",
      "2 Tomatoes, chopped",
      "1/2 tsp Garam masala & 1 tsp ghee",
      "1 tsp Turmeric & red chilli powder",
      "3 tbsp Mustard oil & salt"
    ],
    "steps": [
      "Lightly fry the lobster pieces in mustard oil for 2 minutes. Set aside.",
      "In the same oil, add cardamoms and cloves. Saut\u00e9 onion puree and ginger-garlic paste until brown.",
      "Add tomatoes, chilli powder, and turmeric. Saut\u00e9 until oil separates.",
      "Add 1.5 cups of warm water and salt. Slide in lobster pieces. Simmer for 15 minutes.",
      "Finish with ghee and garam masala. Serve hot."
    ]
  },
  {
    "id": "lobster-south-indian",
    "title": "Kerala Malabar Lobster Curry",
    "fishType": "Spiny Lobster",
    "prepType": "Curry",
    "region": "South Indian",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
    "ingredients": [
      "2 Lobster tails, cleaned",
      "1 cup fresh coconut milk",
      "4 Shallots, sliced",
      "2 Kokum petals",
      "1.5 tbsp Chilli powder",
      "3 tbsp Coconut oil & curry leaves"
    ],
    "steps": [
      "Heat coconut oil in a clay pot. Saut\u00e9 curry leaves and sliced shallots.",
      "Add chilli powder, turmeric, ginger-garlic, and 1 cup of water. Saut\u00e9 for 2 minutes.",
      "Add lobster. Cook for 5 minutes.",
      "Add kokum extract, pour in coconut milk. Simmer on low heat for 10 minutes. Garnish and serve."
    ]
  },
  {
    "id": "lobster-telugu",
    "title": "Andhra Spiced Lobster Curry",
    "fishType": "Spiny Lobster",
    "prepType": "Curry",
    "region": "Telugu",
    "difficulty": "Expert",
    "time": "40 min",
    "image": "https://images.unsplash.com/photo-1621996346565-e3bb64e0be5e?q=80&w=800",
    "ingredients": [
      "2 Lobster tails, cut into chunks",
      "1 Onion, finely chopped",
      "2 Tomatoes, pureed",
      "1 tbsp Ginger-garlic paste",
      "1.5 tbsp Andhra spicy curry powder (coriander, cumin, pepper, cloves)",
      "2 Green chillies, slit",
      "Tamarind extract (1 tsp)",
      "Curry leaves & coriander",
      "3 tbsp Sesame oil & salt"
    ],
    "steps": [
      "Saut\u00e9 chopped lobster chunks in a little oil with turmeric for 2 minutes. Set aside.",
      "Heat sesame oil in a pot. Splutter curry leaves, green chillies, and fry onions till brown.",
      "Add ginger-garlic paste, tomato puree, Andhra spice powder, and salt. Cook till oil separates.",
      "Add 1.5 cups of water and tamarind extract, bring to boil.",
      "Add lobster pieces, cover and cook on medium-low for 12-15 minutes until tender.",
      "Garnish with chopped coriander and serve hot."
    ]
  },
  {
    "id": "lobster-andaman",
    "title": "Andaman Kokum Lobster Curry",
    "fishType": "Spiny Lobster",
    "prepType": "Curry",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "35 min",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
    "ingredients": [
      "2 Lobster tails",
      "1 cup fresh coconut milk",
      "4 dried Kokum petals",
      "4 Shallots, sliced",
      "2 tbsp coconut oil & curry leaves"
    ],
    "steps": [
      "Heat coconut oil. Saut\u00e9 curry leaves and shallots.",
      "Add kokum extract, slit green chillies, and 1/2 cup of water. Saut\u00e9 for 2 minutes.",
      "Add lobster tails. Cook for 5 minutes.",
      "Pour in coconut milk, simmer on low heat for 8 minutes. Garnish and serve."
    ]
  },
  {
    "id": "lobster-butter",
    "title": "Butter Garlic Charcoal Lobster",
    "fishType": "Spiny Lobster",
    "prepType": "Grill",
    "region": "Andaman Local",
    "difficulty": "Expert",
    "time": "30 min",
    "image": "https://images.unsplash.com/photo-1553618551-fba68c8b4df7?q=80&w=800",
    "ingredients": [
      "2 Spiny Lobster tails, split lengthwise",
      "4 tbsp Unsalted butter, softened",
      "4 cloves Garlic, minced",
      "1 tbsp Fresh parsley, chopped",
      "1 tsp Lemon zest & 1 tbsp Lemon juice",
      "1/2 tsp Sea salt & cracked black pepper"
    ],
    "steps": [
      "Clean lobster tails. Use kitchen shears to cut the top shell down the center, pull the meat upward and rest it on top of the shell.",
      "In a small bowl, mix softened butter, minced garlic, parsley, lemon zest, lemon juice, salt, and pepper.",
      "Slather the garlic butter generously over the lobster meat.",
      "Preheat your grill or oven broiler. Grill lobster tails shell-side down for 6 minutes.",
      "Flip and grill meat-side down for 2 minutes to char slightly.",
      "Flip back, baste with more garlic butter, and cook for 2-3 minutes until meat is white and opaque.",
      "Serve hot with extra melted garlic butter for dipping."
    ]
  },
  {
    "id": "lobster-fry",
    "title": "Crispy Masala Fried Lobster Tails",
    "fishType": "Spiny Lobster",
    "prepType": "Fry",
    "region": "South Indian",
    "difficulty": "Expert",
    "time": "25 min",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
    "ingredients": [
      "2 Lobster tails",
      "1.5 tbsp Red chilli powder & 1/2 tsp turmeric",
      "1/2 cup Semolina (rava)",
      "3 tbsp Coconut oil & salt"
    ],
    "steps": [
      "Cut lobster meat into bite-sized chunks.",
      "Mix chilli powder, turmeric, ginger-garlic, lemon juice, and salt. Coat lobster chunks with it.",
      "Roll the marinated pieces in semolina to coat evenly.",
      "Heat coconut oil in a pan and shallow fry the lobster pieces for 6-8 minutes until golden and crispy. Serve hot."
    ]
  }
];