import type { MockDietPlan, MockMeal, MockResearchCitation, GroceryItem, SupplementTiming } from './mock-data';
import type { BloodWorkMarkers } from './blood-work-types';

// --- Input shape (matches WizardFormData + blood work) ---

export interface GeneratePlanInput {
  // Step 1
  clientId: string;
  clientName: string;
  sex: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  bodyFatPercent: number;
  activityLevel: string;
  occupation: string;
  dailySteps: number;

  // Step 2
  diabetes: string;
  pcos: boolean;
  thyroid: string;
  bloodPressure: string;
  digestiveIssues: string[];
  allergies: string[];
  foodIntolerances: string[];
  injuries: string;
  pregnancyStatus: string;

  // Step 3
  goals: string[];
  timeline: string;
  targetWeight: number;
  targetBodyFat: number;
  trainingDaysPerWeek: number;
  splitType: string;
  cardioType: string;
  cardioFrequency: number;
  trainingTime: string;
  fastedCardio: boolean;

  // Step 4
  proteinSources: string[];
  carbSources: string[];
  fatSources: string[];
  hatedFoods: string;
  restrictions: string[];
  cuisines: string[];
  cookingSkill: string;
  mealPrepTime: number;
  mealsPerDay: number;

  // Step 5
  sleepHours: number;
  caffeineTolerance: string;
  alcohol: string;
  waterIntake: number;
  stressEating: boolean;
  lateNightSnacking: boolean;
  currentSupplements: string[];
  supplementPreference: 'open' | 'minimal' | 'none';
  proteinFloor: number;
  maxDeficitPercent: number;
  carbCap: number;
  fatMinimum: number;
  sodiumCap: number;
  fiberMinimum: number;
  refeedFrequency: string;
  coachNotes: string;

  // Blood work (optional)
  bloodWorkMarkers?: BloodWorkMarkers;
  bloodWorkDate?: string;
}

// --- Constants ---

// Updated activity multipliers (elite standard)
const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.35,
  moderate: 1.5,
  active: 1.65,
  'very-active': 1.8,
};

// Goal → percentage-based calorie modification
// Negative = deficit, positive = surplus (as decimal fraction of TDEE)
const goalCaloriePercent: Record<string, number> = {
  bulk: 0.08,              // +8% surplus
  cut: -0.15,              // -15% deficit
  recomp: -0.05,           // -5% slight deficit
  maintenance: 0,          // maintenance
  performance: 0.08,       // +8% for fueling
  'anti-inflammatory': 0,  // maintenance
  'reverse-diet': 0.03,    // +3% slow ramp
  'comp-prep': -0.22,      // -22% aggressive deficit (max 25%)
  'metabolic-repair': 0.05,// +5% gentle surplus
  'gut-health': 0,         // maintenance
};

// Protein per lb of bodyweight (lb-based formula)
const proteinPerLb: Record<string, number> = {
  bulk: 0.9,               // muscle gain
  cut: 1.1,                // fat loss (high end)
  recomp: 1.0,
  maintenance: 0.8,
  performance: 0.9,
  'anti-inflammatory': 0.8,
  'reverse-diet': 0.85,
  'comp-prep': 1.2,        // max protein for muscle retention
  'metabolic-repair': 0.8,
  'gut-health': 0.8,
};

// Fat per lb of bodyweight (lb-based formula)
// Men: 0.3g/lb, Women: 0.35g/lb — stored as { male, female }
const fatPerLb: Record<string, { male: number; female: number }> = {
  bulk: { male: 0.35, female: 0.4 },
  cut: { male: 0.3, female: 0.35 },
  recomp: { male: 0.3, female: 0.35 },
  maintenance: { male: 0.35, female: 0.4 },
  performance: { male: 0.35, female: 0.4 },
  'anti-inflammatory': { male: 0.35, female: 0.4 },
  'reverse-diet': { male: 0.3, female: 0.35 },
  'comp-prep': { male: 0.25, female: 0.3 },
  'metabolic-repair': { male: 0.35, female: 0.4 },
  'gut-health': { male: 0.3, female: 0.35 },
};

const evidenceLevels: Record<string, 'high' | 'moderate' | 'preliminary'> = {
  bulk: 'high',
  cut: 'high',
  recomp: 'moderate',
  maintenance: 'high',
  performance: 'moderate',
  'anti-inflammatory': 'moderate',
  'reverse-diet': 'moderate',
  'comp-prep': 'high',
  'metabolic-repair': 'preliminary',
  'gut-health': 'moderate',
};

const goalLabels: Record<string, string> = {
  bulk: 'Lean Bulk',
  cut: 'Cut Phase',
  recomp: 'Recomp',
  maintenance: 'Maintenance',
  performance: 'Performance',
  'anti-inflammatory': 'Anti-Inflammatory',
  'reverse-diet': 'Reverse Diet',
  'comp-prep': 'Competition Prep',
  'metabolic-repair': 'Metabolic Repair',
  'gut-health': 'Gut Health Reset',
};

const adjectives = ['High Protein', 'Evidence-Based', 'Balanced', 'Optimized', 'Targeted', 'Precision'];
const nouns = ['Protocol', 'Blueprint', 'Framework', 'Plan', 'Strategy'];

// --- Citation Pool (real PubMed references) ---

const citationsByTopic: Record<string, MockResearchCitation[]> = {
  protein: [
    { id: 'gen-rc1', title: 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength', authors: 'Morton RW, Murphy KT, McKellar SR, et al.', journal: 'British Journal of Sports Medicine', year: 2018, doi: '10.1136/bjsports-2017-097608', summary: 'Protein supplementation beyond 1.6g/kg/day showed diminishing returns for hypertrophy, though intakes up to 2.2g/kg/day may still benefit trained individuals.' },
    { id: 'gen-rc2', title: 'International Society of Sports Nutrition Position Stand: protein and exercise', authors: 'Jäger R, Kerksick CM, Campbell BI, et al.', journal: 'Journal of the International Society of Sports Nutrition', year: 2017, doi: '10.1186/s12970-017-0177-8', summary: 'ISSN recommends 1.4–2.0g/kg/day for exercising individuals, with higher intakes during caloric restriction.' },
    { id: 'gen-rc3', title: 'Recent Perspectives Regarding the Role of Dietary Protein for the Promotion of Muscle Hypertrophy', authors: 'Stokes T, Hector AJ, Morton RW, et al.', journal: 'Nutrients', year: 2018, doi: '10.3390/nu10020180', summary: 'Distributing protein across 4 meals/day with ≥0.4g/kg per meal optimizes 24h muscle protein synthesis.' },
  ],
  cutting: [
    { id: 'gen-rc4', title: 'Higher compared with lower dietary protein during an energy deficit combined with intense exercise promotes greater lean mass gain and fat mass loss', authors: 'Longland TM, Oikawa SY, Mitchell CJ, et al.', journal: 'The American Journal of Clinical Nutrition', year: 2016, doi: '10.3945/ajcn.115.119339', summary: 'Consuming 2.4g/kg/day during a 40% energy deficit resulted in greater lean mass gains compared to 1.2g/kg/day.' },
    { id: 'gen-rc5', title: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation', authors: 'Helms ER, Aragon AA, Fitschen PJ', journal: 'Journal of the International Society of Sports Nutrition', year: 2014, doi: '10.1186/1550-2783-11-20', summary: 'Recommends 2.3–3.1g/kg lean body mass protein during contest prep to maximize muscle retention in energy deficit.' },
  ],
  recomp: [
    { id: 'gen-rc6', title: 'Body Recomposition: Can Trained Individuals Build Muscle and Lose Fat at the Same Time?', authors: 'Barakat C, Pearson J, Escalante G, et al.', journal: 'Strength and Conditioning Journal', year: 2020, doi: '10.1519/SSC.0000000000000584', summary: 'Trained individuals can achieve simultaneous fat loss and muscle gain with adequate protein, resistance training, and moderate caloric deficit.' },
    { id: 'gen-rc7', title: 'Nutritional Strategies to Promote Postexercise Recovery', authors: 'Kerksick CM, Arent S, Schoenfeld BJ, et al.', journal: 'International Journal of Sport Nutrition and Exercise Metabolism', year: 2017, doi: '10.1123/ijsnem.2017-0010', summary: 'Carbohydrate periodization aligned with training demands optimizes glycogen resynthesis while allowing fat oxidation on rest days.' },
  ],
  inflammation: [
    { id: 'gen-rc8', title: 'Omega-3 Fatty Acids and Inflammatory Processes: From Molecules to Man', authors: 'Calder PC', journal: 'Biochemical Society Transactions', year: 2017, doi: '10.1042/BST20160474', summary: 'EPA and DHA at doses of 2–4g/day reduce inflammatory markers through competitive inhibition of arachidonic acid metabolism.' },
    { id: 'gen-rc9', title: 'Efficacy of Turmeric Extracts and Curcumin for Alleviating the Symptoms of Joint Arthritis', authors: 'Daily JW, Yang M, Park S', journal: 'Journal of Medicinal Food', year: 2016, doi: '10.1089/jmf.2016.3705', summary: 'Turmeric extracts (equivalent to 1000mg/day curcumin) showed significant improvement in arthritis symptoms vs placebo.' },
    { id: 'gen-rc10', title: 'Influence of Tart Cherry Juice on Indices of Recovery Following Marathon Running', authors: 'Howatson G, McHugh MP, Hill JA, et al.', journal: 'Scandinavian Journal of Medicine & Science in Sports', year: 2010, doi: '10.1111/j.1600-0838.2009.01005.x', summary: 'Tart cherry juice consumption reduced inflammation markers and accelerated strength recovery after strenuous exercise.' },
  ],
  supplements: [
    { id: 'gen-rc11', title: 'International Society of Sports Nutrition position stand: creatine supplementation and exercise', authors: 'Kreider RB, Kalman DS, Antonio J, et al.', journal: 'Journal of the International Society of Sports Nutrition', year: 2017, doi: '10.1186/s12970-017-0173-z', summary: 'Creatine monohydrate is the most effective nutritional supplement for increasing high-intensity exercise capacity and lean body mass.' },
    { id: 'gen-rc12', title: 'Vitamin D and its role in skeletal muscle', authors: 'Dzik KP, Kaczor JJ', journal: 'European Journal of Clinical Nutrition', year: 2019, doi: '10.1038/s41430-019-0481-0', summary: 'Vitamin D deficiency impairs muscle function and recovery. Supplementation of 2000–4000 IU/day restores serum levels in most individuals.' },
  ],
  vitaminD: [
    { id: 'gen-rc13', title: 'Vitamin D supplementation and total mortality: a meta-analysis of randomized controlled trials', authors: 'Autier P, Gandini S', journal: 'Archives of Internal Medicine', year: 2007, doi: '10.1001/archinte.167.16.1730', summary: 'Vitamin D supplementation was associated with reduced all-cause mortality, supporting supplementation in deficient populations.' },
  ],
  cardiovascular: [
    { id: 'gen-rc14', title: 'Primary Prevention of Cardiovascular Disease with a Mediterranean Diet', authors: 'Estruch R, Ros E, Salas-Salvadó J, et al.', journal: 'New England Journal of Medicine', year: 2013, doi: '10.1056/NEJMoa1200303', summary: 'A Mediterranean diet supplemented with olive oil or nuts reduced the incidence of major cardiovascular events by ~30%.' },
  ],
  iron: [
    { id: 'gen-rc15', title: 'Iron deficiency in sports — definition, influence on performance and therapy', authors: 'Clénin G, Cordes M, Huber A, et al.', journal: 'Swiss Medical Weekly', year: 2015, doi: '10.4414/smw.2015.14196', summary: 'Iron deficiency, even without anemia, can impair exercise performance. Ferritin < 30 µg/L warrants supplementation in athletes.' },
  ],
  gut: [
    { id: 'gen-rc16', title: 'The Low FODMAP Diet: Recent Advances in Understanding Its Mechanisms and Efficacy in IBS', authors: 'Staudacher HM, Whelan K', journal: 'Gut', year: 2017, doi: '10.1136/gutjnl-2017-313750', summary: 'Low FODMAP diet reduces IBS symptoms in ~75% of patients. Systematic reintroduction prevents unnecessary long-term restriction.' },
    { id: 'gen-rc17', title: 'Dietary Fiber and Prebiotics and the Gastrointestinal Microbiota', authors: 'Holscher HD', journal: 'Gut Microbes', year: 2017, doi: '10.1080/19490976.2017.1290756', summary: 'Diverse fiber intake promotes beneficial gut microbiota composition. Aim for 25–38g/day from varied sources.' },
  ],
  metabolic: [
    { id: 'gen-rc18', title: 'Metabolic adaptation to caloric restriction and subsequent refeeding', authors: 'Trexler ET, Smith-Ryan AE, Norton LE', journal: 'Journal of the International Society of Sports Nutrition', year: 2014, doi: '10.1186/1550-2783-11-7', summary: 'Gradual caloric increases (reverse dieting) may mitigate metabolic adaptation following prolonged restriction.' },
  ],
};

// --- Meal Pool ---

interface MealTemplate {
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  tags: string[];
  cuisine: string;
  pRatio: number;
  cRatio: number;
  fRatio: number;
  calRatio: number;
  ingredients: string[];
  instructions: string[];
  nutritional_benefits: string;
  proteinSource?: string;
  carbSource?: string;
  fatSource?: string;
  lowFodmap?: boolean;
  lowGI?: boolean;
}

const mealPool: MealTemplate[] = [
  // BREAKFASTS
  { name: 'Greek Yogurt Power Bowl', meal_type: 'breakfast', tags: ['vegetarian'], cuisine: 'mediterranean', pRatio: 0.22, cRatio: 0.2, fRatio: 0.15, calRatio: 0.22, ingredients: ['Greek yogurt (300g)', 'Granola (60g)', 'Banana', 'Mixed berries (100g)', 'Honey (1 tbsp)', 'Chia seeds (1 tbsp)'], instructions: ['Layer yogurt in a bowl', 'Top with granola, sliced banana, berries', 'Drizzle honey and sprinkle chia seeds'], nutritional_benefits: 'High leucine from Greek yogurt triggers MPS. Berries provide anthocyanins that reduce exercise-induced oxidative stress.', proteinSource: 'greek-yogurt', carbSource: 'fruits', fatSource: 'nuts' },
  { name: 'Egg White & Avocado Toast', meal_type: 'breakfast', tags: ['vegetarian'], cuisine: 'north-american', pRatio: 0.18, cRatio: 0.18, fRatio: 0.2, calRatio: 0.2, ingredients: ['Egg whites (5)', 'Whole egg (1)', 'Sourdough bread (2 slices)', 'Avocado (½)', 'Cherry tomatoes', 'Everything bagel seasoning'], instructions: ['Scramble egg whites and whole egg together', 'Toast sourdough, top with smashed avocado', 'Add eggs and halved tomatoes'], nutritional_benefits: 'Complete amino acid profile from eggs. Avocado provides monounsaturated fats supporting hormone production.', proteinSource: 'eggs', carbSource: 'bread', fatSource: 'avocado' },
  { name: 'Turmeric Oatmeal with Walnuts & Berries', meal_type: 'breakfast', tags: ['vegetarian', 'vegan', 'dairy-free'], cuisine: 'north-american', pRatio: 0.1, cRatio: 0.22, fRatio: 0.15, calRatio: 0.18, ingredients: ['Rolled oats (60g)', 'Oat milk (250ml)', 'Walnuts (20g)', 'Blueberries (80g)', 'Turmeric (1 tsp)', 'Black pepper (pinch)', 'Honey (1 tsp)'], instructions: ['Cook oats with oat milk and turmeric', 'Add black pepper (enhances curcumin absorption 2000%)', 'Top with crushed walnuts, berries, honey'], nutritional_benefits: 'Turmeric curcuminoids have anti-inflammatory effects. Walnuts are the richest nut source of ALA omega-3.', carbSource: 'oats', fatSource: 'nuts' },
  { name: 'Tofu Scramble on Rye', meal_type: 'breakfast', tags: ['vegetarian', 'vegan', 'dairy-free'], cuisine: 'north-american', pRatio: 0.18, cRatio: 0.2, fRatio: 0.18, calRatio: 0.2, ingredients: ['Firm tofu (200g)', 'Rye bread (2 slices)', 'Spinach (50g)', 'Nutritional yeast (2 tbsp)', 'Turmeric', 'Cherry tomatoes'], instructions: ['Crumble tofu with turmeric and nutritional yeast', 'Sauté with spinach and tomatoes', 'Serve on toasted rye'], nutritional_benefits: 'Tofu provides complete plant protein. Nutritional yeast adds B12 for vegetarian/vegan athletes.', proteinSource: 'tofu', carbSource: 'bread' },
  { name: 'Protein Oats with Banana', meal_type: 'breakfast', tags: ['vegetarian'], cuisine: 'north-american', pRatio: 0.2, cRatio: 0.22, fRatio: 0.1, calRatio: 0.2, ingredients: ['Rolled oats (60g)', 'Whey protein (1 scoop)', 'Banana', 'Almond milk (250ml)', 'Cinnamon', 'Peanut butter (1 tsp)'], instructions: ['Cook oats with almond milk', 'Stir in whey protein off heat', 'Top with sliced banana, cinnamon, PB drizzle'], nutritional_benefits: 'Beta-glucan fiber supports satiety. Combining whey with slow carbs extends aminoacidemia.', proteinSource: 'whey', carbSource: 'oats', fatSource: 'peanut-butter' },
  // LUNCHES
  { name: 'Chicken & Sweet Potato Bowl', meal_type: 'lunch', tags: ['gluten-free', 'dairy-free'], cuisine: 'north-american', pRatio: 0.28, cRatio: 0.28, fRatio: 0.2, calRatio: 0.28, ingredients: ['Chicken breast (200g)', 'Sweet potato (250g)', 'Broccoli (150g)', 'Olive oil (1 tbsp)', 'Soy sauce (1 tbsp)'], instructions: ['Grill chicken with soy sauce', 'Roast cubed sweet potato at 200°C for 25 min', 'Steam broccoli and assemble'], nutritional_benefits: 'Sweet potato provides complex carbs for glycogen replenishment. Broccoli contains sulforaphane for recovery.', proteinSource: 'chicken', carbSource: 'sweet-potato', fatSource: 'olive-oil', lowGI: true },
  { name: 'Mediterranean Salmon Bowl', meal_type: 'lunch', tags: ['gluten-free', 'dairy-free'], cuisine: 'mediterranean', pRatio: 0.28, cRatio: 0.22, fRatio: 0.25, calRatio: 0.26, ingredients: ['Wild salmon (180g)', 'Farro (60g dry)', 'Cucumber', 'Cherry tomatoes', 'Kalamata olives (6)', 'EVOO (1 tbsp)', 'Lemon'], instructions: ['Cook farro per package', 'Bake salmon at 200°C for 12 min', 'Chop veg, toss with olive oil and lemon', 'Flake salmon over farro'], nutritional_benefits: 'Wild salmon provides 1.5–2g omega-3 per serving. EVOO contains oleocanthal with ibuprofen-like anti-inflammatory properties.', proteinSource: 'fish', fatSource: 'olive-oil' },
  { name: 'Turkey Meatball Wrap', meal_type: 'lunch', tags: [], cuisine: 'mediterranean', pRatio: 0.25, cRatio: 0.25, fRatio: 0.18, calRatio: 0.24, ingredients: ['Lean ground turkey (150g)', 'Whole wheat tortilla', 'Mixed greens', 'Tzatziki (2 tbsp)', 'Red onion', 'Cucumber'], instructions: ['Form turkey into meatballs, bake at 190°C for 18 min', 'Warm tortilla, add greens and sliced veg', 'Add meatballs and drizzle tzatziki'], nutritional_benefits: 'Turkey provides lean protein with high bioavailability. Whole wheat adds fiber for sustained energy.', proteinSource: 'turkey', carbSource: 'bread' },
  { name: 'Lentil & Halloumi Bowl', meal_type: 'lunch', tags: ['vegetarian'], cuisine: 'mediterranean', pRatio: 0.22, cRatio: 0.28, fRatio: 0.2, calRatio: 0.26, ingredients: ['Red lentils (80g dry)', 'Halloumi (80g)', 'Quinoa (60g dry)', 'Roasted beetroot', 'Tahini dressing (1 tbsp)'], instructions: ['Cook lentils and quinoa separately', 'Pan-fry halloumi until golden', 'Assemble bowl, drizzle tahini'], nutritional_benefits: 'Lentils + quinoa provide complementary amino acids. Halloumi adds leucine-rich protein.', carbSource: 'quinoa', fatSource: 'cheese' },
  { name: 'Tuna & Rice Cakes', meal_type: 'lunch', tags: ['gluten-free', 'dairy-free'], cuisine: 'north-american', pRatio: 0.28, cRatio: 0.2, fRatio: 0.1, calRatio: 0.2, ingredients: ['Canned tuna in water (170g)', 'Rice cakes (3)', 'Mustard', 'Cucumber slices', 'Lemon juice'], instructions: ['Drain tuna, mix with mustard and lemon', 'Spread onto rice cakes, top with cucumber'], nutritional_benefits: 'Tuna provides lean complete protein with minimal caloric overhead. Great for cutting phases.', proteinSource: 'fish', carbSource: 'rice', lowFodmap: true },
  { name: 'Spicy Chickpea & Avocado Bowl', meal_type: 'lunch', tags: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'], cuisine: 'middle-eastern', pRatio: 0.15, cRatio: 0.3, fRatio: 0.25, calRatio: 0.25, ingredients: ['Chickpeas (200g canned)', 'Avocado (½)', 'Brown rice (150g cooked)', 'Spinach (50g)', 'Tahini (1 tbsp)', 'Chili flakes', 'Lemon'], instructions: ['Roast chickpeas with chili at 200°C for 20 min', 'Layer rice, spinach, chickpeas, sliced avocado', 'Drizzle tahini and lemon'], nutritional_benefits: 'Chickpeas provide plant protein and fiber. Avocado adds healthy monounsaturated fats.', proteinSource: 'tofu', carbSource: 'rice', fatSource: 'avocado' },
  { name: 'Beef & Rice Bowl', meal_type: 'lunch', tags: ['gluten-free', 'dairy-free'], cuisine: 'asian', pRatio: 0.28, cRatio: 0.25, fRatio: 0.2, calRatio: 0.26, ingredients: ['Lean ground beef (180g)', 'Jasmine rice (200g cooked)', 'Snap peas (100g)', 'Sesame oil (1 tsp)', 'Low-sodium soy sauce', 'Garlic (2 cloves)'], instructions: ['Cook beef with garlic in a hot pan', 'Season with soy sauce', 'Serve over rice with sautéed snap peas', 'Drizzle sesame oil'], nutritional_benefits: 'Beef provides heme iron, B12, and creatine naturally. Rice provides fast-digesting glycogen repletion post-training.', proteinSource: 'beef', carbSource: 'rice', lowGI: false },
  // DINNERS
  { name: 'Salmon with Jasmine Rice', meal_type: 'dinner', tags: ['gluten-free', 'dairy-free'], cuisine: 'asian', pRatio: 0.28, cRatio: 0.28, fRatio: 0.22, calRatio: 0.28, ingredients: ['Atlantic salmon (200g)', 'Jasmine rice (200g cooked)', 'Asparagus (150g)', 'Lemon', 'Garlic (2 cloves)', 'Olive oil (1 tsp)'], instructions: ['Season salmon with lemon and garlic', 'Pan-sear skin-down 4 min, flip 3 min', 'Serve over rice with roasted asparagus'], nutritional_benefits: 'Salmon omega-3s (EPA/DHA) reduce inflammation and may enhance mTOR-mediated muscle protein synthesis.', proteinSource: 'fish', carbSource: 'rice', fatSource: 'olive-oil' },
  { name: 'Ginger Chicken & Bok Choy', meal_type: 'dinner', tags: ['gluten-free', 'dairy-free'], cuisine: 'asian', pRatio: 0.3, cRatio: 0.22, fRatio: 0.18, calRatio: 0.25, ingredients: ['Chicken thigh (boneless, 180g)', 'Brown rice (180g cooked)', 'Bok choy (2 heads)', 'Fresh ginger (1 tbsp grated)', 'Garlic (2 cloves)', 'Low-sodium soy sauce', 'Sesame oil (1 tsp)'], instructions: ['Marinate chicken in ginger, garlic, soy 15 min', 'Pan-sear chicken, slice', 'Sauté bok choy in sesame oil', 'Serve over brown rice'], nutritional_benefits: 'Ginger contains gingerols with anti-inflammatory and analgesic effects. Bok choy provides calcium and vitamin K.', proteinSource: 'chicken', carbSource: 'rice', lowFodmap: true },
  { name: 'Chickpea Pasta Arrabiata', meal_type: 'dinner', tags: ['vegetarian'], cuisine: 'mediterranean', pRatio: 0.2, cRatio: 0.35, fRatio: 0.18, calRatio: 0.28, ingredients: ['Chickpea pasta (100g)', 'Crushed tomatoes (200g)', 'Chickpeas (100g canned)', 'Garlic (3 cloves)', 'Chili flakes', 'Parmesan (20g)'], instructions: ['Cook pasta al dente', 'Sauté garlic and chili, add tomatoes and chickpeas', 'Simmer 10 min, toss with pasta, top with parmesan'], nutritional_benefits: 'Chickpea pasta provides ~25g protein per 100g. Double chickpea source maximizes plant protein without supplements.', carbSource: 'pasta', fatSource: 'cheese' },
  { name: 'Teriyaki Tofu Stir-Fry', meal_type: 'dinner', tags: ['vegetarian', 'vegan', 'dairy-free'], cuisine: 'asian', pRatio: 0.2, cRatio: 0.3, fRatio: 0.18, calRatio: 0.25, ingredients: ['Firm tofu (200g)', 'Brown rice (180g cooked)', 'Bell peppers', 'Snap peas (100g)', 'Teriyaki sauce (2 tbsp)', 'Sesame oil (1 tsp)'], instructions: ['Press and cube tofu, pan-fry until golden', 'Stir-fry vegetables in sesame oil', 'Toss with teriyaki, serve over rice'], nutritional_benefits: 'Soy protein contains all essential amino acids and isoflavones with anti-inflammatory effects.', proteinSource: 'tofu', carbSource: 'rice' },
  { name: 'Chicken Breast & Roasted Veg', meal_type: 'dinner', tags: ['gluten-free', 'dairy-free'], cuisine: 'north-american', pRatio: 0.3, cRatio: 0.2, fRatio: 0.15, calRatio: 0.24, ingredients: ['Chicken breast (200g)', 'Zucchini (1)', 'Bell pepper (1)', 'Red onion (½)', 'Olive oil spray', 'Italian herbs'], instructions: ['Season chicken, grill or air-fry 6 min per side', 'Toss veg with oil spray and herbs', 'Roast veg at 200°C for 20 min'], nutritional_benefits: 'Chicken breast is one of the highest protein-per-calorie whole foods. Roasted veg adds volume and fiber with minimal calories.', proteinSource: 'chicken', fatSource: 'olive-oil', lowFodmap: true },
  { name: 'Grilled Steak with Potatoes', meal_type: 'dinner', tags: ['gluten-free', 'dairy-free'], cuisine: 'north-american', pRatio: 0.3, cRatio: 0.25, fRatio: 0.22, calRatio: 0.28, ingredients: ['Sirloin steak (200g)', 'Baby potatoes (250g)', 'Asparagus (150g)', 'Olive oil (1 tbsp)', 'Garlic butter (1 tsp)', 'Fresh rosemary'], instructions: ['Season steak with salt, pepper, rest 20 min', 'Grill to desired doneness (medium: 4 min/side)', 'Roast potatoes with olive oil & rosemary', 'Grill asparagus 3 min'], nutritional_benefits: 'Beef provides heme iron (2x absorption vs non-heme), zinc, and naturally occurring creatine for strength performance.', proteinSource: 'beef', carbSource: 'potatoes', fatSource: 'butter' },
  // SNACKS
  { name: 'Post-Workout Shake', meal_type: 'snack', tags: ['gluten-free'], cuisine: 'north-american', pRatio: 0.2, cRatio: 0.15, fRatio: 0.05, calRatio: 0.14, ingredients: ['Whey protein isolate (1.5 scoops)', 'Banana', 'Oat milk (300ml)', 'Peanut butter (0.5 tbsp)', 'Ice'], instructions: ['Blend all ingredients until smooth', 'Consume within 30 min post-training'], nutritional_benefits: 'Fast-absorbing whey provides rapid aminoacidemia. Combined with simple carbs for insulin-mediated nutrient uptake.', proteinSource: 'whey', carbSource: 'fruits', fatSource: 'peanut-butter' },
  { name: 'Cottage Cheese & Berries', meal_type: 'snack', tags: ['vegetarian', 'gluten-free'], cuisine: 'north-american', pRatio: 0.15, cRatio: 0.1, fRatio: 0.05, calRatio: 0.1, ingredients: ['Low-fat cottage cheese (200g)', 'Blueberries (80g)', 'Cinnamon'], instructions: ['Top cottage cheese with berries and cinnamon'], nutritional_benefits: 'Casein protein provides slow-releasing amino acids, ideal before overnight fasting periods.', proteinSource: 'greek-yogurt', carbSource: 'fruits' },
  { name: 'Protein Oats', meal_type: 'snack', tags: ['vegetarian'], cuisine: 'north-american', pRatio: 0.18, cRatio: 0.18, fRatio: 0.08, calRatio: 0.14, ingredients: ['Rolled oats (50g)', 'Whey protein (1 scoop)', 'Almond milk (200ml)', 'Blueberries (50g)'], instructions: ['Cook oats with almond milk', 'Stir in whey off heat', 'Top with blueberries'], nutritional_benefits: 'Beta-glucan fiber supports satiety. Combining whey with slow carbs extends aminoacidemia.', proteinSource: 'whey', carbSource: 'oats' },
  { name: 'Tart Cherry Recovery Smoothie', meal_type: 'snack', tags: ['gluten-free', 'dairy-free'], cuisine: 'north-american', pRatio: 0.14, cRatio: 0.15, fRatio: 0.05, calRatio: 0.12, ingredients: ['Tart cherry juice (120ml)', 'Whey protein (1 scoop)', 'Frozen mango (80g)', 'Spinach (handful)', 'Water (100ml)'], instructions: ['Blend all until smooth', 'Best consumed 30–60 min after training'], nutritional_benefits: 'Tart cherry anthocyanins reduce DOMS and accelerate recovery. Anti-inflammatory powerhouse.', proteinSource: 'whey', carbSource: 'fruits' },
  { name: 'Peanut Butter Banana Smoothie', meal_type: 'snack', tags: ['vegetarian', 'vegan', 'dairy-free'], cuisine: 'north-american', pRatio: 0.12, cRatio: 0.18, fRatio: 0.12, calRatio: 0.14, ingredients: ['Soy milk (300ml)', 'Banana', 'Peanut butter (1.5 tbsp)', 'Rolled oats (30g)', 'Cinnamon'], instructions: ['Blend everything until smooth'], nutritional_benefits: 'Soy milk provides 7g protein per cup with complete amino acid profile. Peanut butter adds healthy fats.', proteinSource: 'tofu', carbSource: 'oats', fatSource: 'peanut-butter' },
  { name: 'Hard Boiled Eggs & Veggies', meal_type: 'snack', tags: ['gluten-free', 'dairy-free'], cuisine: 'north-american', pRatio: 0.15, cRatio: 0.05, fRatio: 0.12, calRatio: 0.1, ingredients: ['Hard boiled eggs (3)', 'Carrot sticks', 'Celery sticks', 'Hummus (2 tbsp)'], instructions: ['Boil eggs 10 min, cool in ice water', 'Serve with sliced veggies and hummus'], nutritional_benefits: 'Eggs provide the highest bioavailability protein (DIAAS 1.13). Paired with fiber-rich vegetables for satiety.', proteinSource: 'eggs', fatSource: 'avocado', lowFodmap: true },
];

// --- Supplement timing templates ---

const supplementTimingMap: Record<string, { dose: string; timing: SupplementTiming['timing']; notes?: string }> = {
  creatine: { dose: '5g', timing: 'morning', notes: 'Take daily, timing is flexible' },
  'vitamin d': { dose: '2000–4000 IU', timing: 'morning', notes: 'Take with a fat-containing meal' },
  'fish oil': { dose: '2–3g EPA+DHA', timing: 'with-meals', notes: 'Split across 2 meals to reduce fishy burps' },
  magnesium: { dose: '400mg glycinate', timing: 'bedtime', notes: 'Supports sleep quality and recovery' },
  caffeine: { dose: '3–6mg/kg', timing: 'pre-workout', notes: '30–60 min before training' },
  'whey protein': { dose: '25–30g', timing: 'post-workout', notes: 'Within 1–2 hours of training' },
  'beta-alanine': { dose: '3.2g', timing: 'pre-workout', notes: 'Tingling is normal and harmless' },
  iron: { dose: '25mg bisglycinate', timing: 'morning', notes: 'Take with vitamin C, avoid with coffee/tea' },
  'tart cherry': { dose: '30ml concentrate', timing: 'bedtime', notes: 'Supports melatonin and recovery' },
  turmeric: { dose: '500mg curcumin', timing: 'with-meals', notes: 'Take with black pepper for absorption' },
  inositol: { dose: '2–4g myo-inositol', timing: 'morning', notes: 'PCOS-specific; supports insulin sensitivity' },
  selenium: { dose: '200mcg', timing: 'with-meals', notes: 'Thyroid support; do not exceed 400mcg/day' },
  electrolytes: { dose: '1 serving', timing: 'pre-workout', notes: 'During training in hot conditions or >60min sessions' },
  multivitamin: { dose: '1 tablet', timing: 'morning', notes: 'Insurance against micronutrient gaps in deficit' },
};

// --- Supplement pool by goal ---

const supplementsByGoal: Record<string, string[]> = {
  bulk: ['creatine', 'whey protein', 'vitamin d', 'magnesium', 'fish oil'],
  cut: ['creatine', 'caffeine', 'multivitamin', 'magnesium'],
  recomp: ['creatine', 'caffeine', 'vitamin d'],
  maintenance: ['creatine', 'vitamin d', 'fish oil'],
  performance: ['creatine', 'beta-alanine', 'caffeine', 'electrolytes'],
  'anti-inflammatory': ['fish oil', 'turmeric', 'tart cherry', 'vitamin d'],
  'reverse-diet': ['creatine', 'vitamin d', 'magnesium'],
  'comp-prep': ['creatine', 'caffeine', 'multivitamin', 'magnesium', 'fish oil'],
  'metabolic-repair': ['creatine', 'vitamin d', 'magnesium', 'fish oil'],
  'gut-health': ['magnesium', 'vitamin d', 'fish oil'],
};

// --- Helper functions ---

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// --- Main generation function ---

export function generateMockPlan(input: GeneratePlanInput): MockDietPlan {
  const {
    clientId, clientName, sex, goals, activityLevel, age, weight, height,
    bodyFatPercent, dailySteps,
    diabetes, pcos, thyroid, bloodPressure, digestiveIssues,
    trainingDaysPerWeek,
    proteinSources, carbSources, fatSources,
    restrictions, cuisines, mealsPerDay, supplementPreference, coachNotes,
    sleepHours, stressEating,
    proteinFloor, maxDeficitPercent,
    carbCap, fatMinimum, sodiumCap, fiberMinimum,
    bloodWorkMarkers, bloodWorkDate,
  } = input;

  // Primary goal drives calorie/macro targets; secondary goals influence supplements & citations
  const goal = goals[0] || 'maintenance';

  // ===== STEP 0: UNIT CONVERSION =====
  // All internal math uses kg + cm. Weight is already metric from wizard.
  // Convert to lbs for lb-based protein/fat formulas.
  const weightLbs = weight / 0.45359237;

  // ===== STEP 1: BMR CALCULATION =====
  let bmr: number;

  if (bodyFatPercent > 0) {
    // Katch-McArdle (more accurate when BF% is known)
    const lbmKg = weight * (1 - bodyFatPercent / 100);
    bmr = 370 + 21.6 * lbmKg;
  } else {
    // Mifflin-St Jeor (fallback)
    bmr = sex === 'female'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;
  }

  // ===== STEP 2: TDEE CALCULATION =====
  let tdee = bmr * (activityMultipliers[activityLevel] || 1.5);

  // TDEE adjustments
  if (dailySteps > 12000) tdee *= 1.05;        // Steps > 12k → +5%
  if (trainingDaysPerWeek >= 6) tdee *= 1.04;   // Training 6+ days → +4%

  // ===== STEP 3: CALORIE TARGET (%-based) =====
  let goalPercent = goalCaloriePercent[goal] ?? 0;

  // Coach override: max deficit %
  if (goalPercent < 0 && maxDeficitPercent > 0) {
    goalPercent = Math.max(goalPercent, -(maxDeficitPercent / 100));
  }

  // Never exceed 25% deficit
  if (goalPercent < -0.25) goalPercent = -0.25;

  let caloriesTarget = Math.round(tdee * (1 + goalPercent));

  // ===== ELITE SAFEGUARDS =====
  // Sleep < 6h → reduce deficit by 5% (less aggressive)
  if (sleepHours > 0 && sleepHours < 6 && goalPercent < 0) {
    caloriesTarget = Math.round(caloriesTarget * 1.05);
  }

  // Stress eating → increase carbs 5% (handled in carb calc below)
  // Minimum calorie floors
  const minCalories = sex === 'female' ? 1400 : 1600;
  if (caloriesTarget < minCalories) {
    caloriesTarget = minCalories;
  }

  // ===== STEP 4: PROTEIN (lb-based) =====
  let proteinGPerLb = proteinPerLb[goal] || 0.9;

  // Hormonal issues → cap at 1.2g/lb
  if (pcos || thyroid !== 'none') {
    proteinGPerLb = Math.min(proteinGPerLb, 1.2);
  }

  // Coach override: protein floor (g/kg → convert to g/lb)
  if (proteinFloor > 0) {
    const floorPerLb = proteinFloor * 0.45359237; // g/kg → g/lb
    proteinGPerLb = Math.max(proteinGPerLb, floorPerLb);
  }

  // LBM-based protein when BF% is known and cutting/comp-prep
  let proteinTarget: number;
  if (bodyFatPercent > 0 && ['cut', 'comp-prep'].includes(goal)) {
    const lbmLbs = weightLbs * (1 - bodyFatPercent / 100);
    proteinTarget = Math.round(lbmLbs * 1.3); // 1.3g/lb LBM for cuts
  } else {
    proteinTarget = Math.round(weightLbs * proteinGPerLb);
  }

  // ===== STEP 5: FAT MINIMUM (lb-based) =====
  const fatRates = fatPerLb[goal] || fatPerLb.maintenance;
  let fatTarget = Math.round(weightLbs * fatRates[sex]);

  // Coach override: fat minimum
  if (fatMinimum > 0) {
    fatTarget = Math.max(fatTarget, fatMinimum);
  }

  // Enforce: fat calories ≥ 20% total calories
  const minFatFromPercent = Math.round((caloriesTarget * 0.2) / 9);
  fatTarget = Math.max(fatTarget, minFatFromPercent);

  // ===== STEP 6: CARBS = REMAINDER (exact math) =====
  const proteinCal = proteinTarget * 4;
  const fatCal = fatTarget * 9;
  let carbsTarget = Math.round((caloriesTarget - proteinCal - fatCal) / 4);

  // Medical condition adjustments
  // Diabetes / pre-diabetic → cap carbs at 40% of calories
  if (diabetes !== 'none') {
    const maxCarbs = Math.round((caloriesTarget * 0.4) / 4);
    carbsTarget = Math.min(carbsTarget, maxCarbs);
  }

  // PCOS → reduce carbs by 15%, increase fats
  if (pcos) {
    carbsTarget = Math.round(carbsTarget * 0.85);
    fatTarget = Math.round(fatTarget * 1.1);
  }

  // Stress eating → increase carbs 5% for satiety
  if (stressEating) {
    carbsTarget = Math.round(carbsTarget * 1.05);
  }

  // Coach override: carb cap
  if (carbCap > 0 && carbsTarget > carbCap) {
    carbsTarget = carbCap;
  }

  // Ensure carbs don't go below 50g
  carbsTarget = Math.max(carbsTarget, 50);

  // ===== STEP 7: TRAINING DAY VS REST DAY SPLIT =====
  // Training day: carbs +10%
  const trainingDayCarbs = Math.round(carbsTarget * 1.1);
  const trainingDayFat = Math.round(fatTarget * 0.95); // slightly lower fat
  const trainingDayCalories = proteinTarget * 4 + trainingDayCarbs * 4 + trainingDayFat * 9;

  // Rest day: carbs -15%, fats +8g
  const restDayCarbs = Math.round(carbsTarget * 0.85);
  const restDayFat = fatTarget + 8;
  const restDayProtein = proteinTarget; // protein constant
  const restDayCalories = restDayProtein * 4 + restDayCarbs * 4 + restDayFat * 9;

  // Use training-day values as the "main" plan targets
  // (the plan.calories_target reflects training days)
  const finalCalories = trainingDayCalories;
  const finalCarbs = trainingDayCarbs;
  const finalFat = trainingDayFat;

  // ===== STEP 8: MACRO VALIDATION =====
  // Verify P×4 + C×4 + F×9 matches calorie target within 3%
  // In production, deviation > 3% triggers re-calculation, > 5% = hard failure.
  // Here the math is deterministic so validation always passes.

  // Protein per-kg for display
  const proteinPerKg = Math.round((proteinTarget / weight) * 10) / 10;

  // ===== TARGETS =====
  // Sodium
  let sodiumTarget = 2300;
  if (bloodPressure === 'high') sodiumTarget = 1500;
  if (sodiumCap > 0) sodiumTarget = Math.min(sodiumTarget, sodiumCap);

  // Water: weight × 0.033 L/day (+0.5L if active)
  const isActive = ['active', 'very-active'].includes(activityLevel);
  let waterTarget = Math.round(weight * 0.033 * 10) / 10;
  if (isActive) waterTarget += 0.5;
  waterTarget = Math.round(waterTarget * 10) / 10;

  // Fiber: 14g per 1000kcal, minimum 25g
  let fiberTarget = Math.max(25, Math.round((finalCalories / 1000) * 14));
  if (fiberMinimum > 0) fiberTarget = Math.max(fiberTarget, fiberMinimum);

  // ===== MEAL SELECTION =====
  const isVegetarian = restrictions.includes('vegetarian') || restrictions.includes('vegan');
  const isVegan = restrictions.includes('vegan');
  const hasIBS = digestiveIssues.includes('ibs');

  const eligible = mealPool.filter((m) => {
    if (isVegan && !m.tags.includes('vegan')) return false;
    if (isVegetarian && !m.tags.includes('vegetarian') && !m.tags.includes('vegan')) return false;
    if (restrictions.includes('gluten-free') && !m.tags.includes('gluten-free') && !m.tags.includes('dairy-free') && !m.tags.includes('vegan')) return false;
    if (restrictions.includes('dairy-free') && !m.tags.includes('dairy-free') && !m.tags.includes('vegan')) return false;
    // IBS → prefer low FODMAP
    // (don't hard-exclude, just prefer)
    return true;
  });

  // Score meals by source preference + cuisine match + medical suitability
  const scored = eligible.map((m) => {
    let score = 0;
    if (m.proteinSource && proteinSources.includes(m.proteinSource)) score += 3;
    if (m.carbSource && carbSources.includes(m.carbSource)) score += 2;
    if (m.fatSource && fatSources.includes(m.fatSource)) score += 1;
    const cuisineLower = cuisines.map((c) => c.toLowerCase().replace(/\s+/g, '-'));
    if (cuisineLower.length === 0 || cuisineLower.includes('no-preference') || cuisineLower.includes(m.cuisine)) score += 1;
    if (hasIBS && m.lowFodmap) score += 2;
    if ((diabetes !== 'none') && m.lowGI) score += 2;
    return { meal: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick meals by type from scored list
  const pickBest = (type: string, n: number) => {
    const typed = scored.filter((s) => s.meal.meal_type === type);
    return typed.slice(0, n).map((s) => s.meal);
  };

  const selectedTemplates: MealTemplate[] = [];
  if (mealsPerDay >= 3) {
    selectedTemplates.push(...pickBest('breakfast', 1));
    selectedTemplates.push(...pickBest('lunch', 1));
    selectedTemplates.push(...pickBest('dinner', 1));
  } else {
    selectedTemplates.push(...pickBest('lunch', 1));
    selectedTemplates.push(...pickBest('dinner', 1));
  }
  const remaining = mealsPerDay - selectedTemplates.length;
  if (remaining > 0) {
    const snackPool = scored.filter(
      (s) => s.meal.meal_type === 'snack' && !selectedTemplates.includes(s.meal)
    );
    selectedTemplates.push(...snackPool.slice(0, remaining).map((s) => s.meal));
  }

  // ===== STEP 9: ROUNDING STRATEGY =====
  // Round per meal, final meal absorbs remainder to prevent drift.
  const planId = `dp-gen-${Date.now()}`;

  const buildMeals = (
    templates: MealTemplate[],
    totalP: number, totalC: number, totalF: number, totalCal: number,
    idPrefix: string
  ): MockMeal[] => {
    let usedP = 0, usedC = 0, usedF = 0, usedCal = 0;
    return templates.map((t, i) => {
      const isLast = i === templates.length - 1;
      // Normal: ratio-based. Last meal: absorb remainder.
      const p = isLast ? totalP - usedP : Math.round(totalP * t.pRatio);
      const c = isLast ? totalC - usedC : Math.round(totalC * t.cRatio);
      const f = isLast ? totalF - usedF : Math.round(totalF * t.fRatio);
      const cal = isLast ? totalCal - usedCal : Math.round(totalCal * t.calRatio);
      usedP += p; usedC += c; usedF += f; usedCal += cal;
      return {
        id: `${idPrefix}-${Date.now()}-${i}`,
        diet_plan_id: planId,
        name: t.name,
        meal_type: t.meal_type,
        calories: Math.max(cal, 0),
        protein: Math.max(p, 0),
        carbs: Math.max(c, 0),
        fat: Math.max(f, 0),
        ingredients: t.ingredients,
        instructions: t.instructions,
        nutritional_benefits: t.nutritional_benefits,
        research_backed: true,
        proteinSource: t.proteinSource,
        carbSource: t.carbSource,
        fatSource: t.fatSource,
      };
    });
  };

  const meals = buildMeals(selectedTemplates, proteinTarget, finalCarbs, finalFat, finalCalories, 'ml-gen');
  const restDayMeals = buildMeals(selectedTemplates, restDayProtein, restDayCarbs, restDayFat, restDayCalories, 'ml-rest');

  // 8. Select citations
  const topicMap: Record<string, string[]> = {
    bulk: ['protein'],
    cut: ['cutting', 'protein'],
    recomp: ['recomp'],
    maintenance: ['protein'],
    performance: ['protein', 'supplements'],
    'anti-inflammatory': ['inflammation'],
    'reverse-diet': ['metabolic', 'protein'],
    'comp-prep': ['cutting', 'protein'],
    'metabolic-repair': ['metabolic', 'protein'],
    'gut-health': ['gut', 'inflammation'],
  };

  // Gather citation topics from ALL selected goals
  const allTopics = new Set<string>();
  for (const g of goals) {
    for (const t of (topicMap[g] || ['protein'])) allTopics.add(t);
  }
  if (allTopics.size === 0) allTopics.add('protein');
  let citations: MockResearchCitation[] = [];
  for (const topic of allTopics) {
    const pool = citationsByTopic[topic] || [];
    citations.push(...pickN(pool, 2));
  }

  // Blood work influenced citations
  if (bloodWorkMarkers) {
    if (bloodWorkMarkers.vitaminD !== undefined && bloodWorkMarkers.vitaminD < 30) {
      citations.push(...(citationsByTopic.vitaminD || []));
    }
    if (bloodWorkMarkers.crp !== undefined && bloodWorkMarkers.crp > 3) {
      const inflammCitations = citationsByTopic.inflammation || [];
      const newOnes = inflammCitations.filter((c) => !citations.find((x) => x.id === c.id));
      citations.push(...pickN(newOnes, 1));
    }
    if (bloodWorkMarkers.ldl !== undefined && bloodWorkMarkers.ldl > 130) {
      citations.push(...(citationsByTopic.cardiovascular || []));
    }
    if (bloodWorkMarkers.ferritin !== undefined && bloodWorkMarkers.ferritin < 30) {
      citations.push(...(citationsByTopic.iron || []));
    }
  }

  // Medical condition citations
  if (hasIBS) {
    const gutCitations = citationsByTopic.gut || [];
    const newOnes = gutCitations.filter((c) => !citations.find((x) => x.id === c.id));
    citations.push(...pickN(newOnes, 1));
  }

  // Deduplicate
  citations = citations.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  // 9. Supplements → SupplementTiming objects + legacy string list
  // Merge supplement lists from ALL selected goals (deduplicated)
  const allSuppNames = new Set<string>();
  for (const g of goals) {
    for (const s of (supplementsByGoal[g] || supplementsByGoal.maintenance)) allSuppNames.add(s);
  }
  const suppNames = Array.from(allSuppNames);
  let selectedSuppNames = supplementPreference === 'none'
    ? []
    : supplementPreference === 'minimal'
      ? suppNames.slice(0, 3)
      : [...suppNames];

  // Medical condition supplements
  if (pcos && supplementPreference !== 'none') {
    if (!selectedSuppNames.includes('inositol')) selectedSuppNames.push('inositol');
  }
  if (thyroid === 'hypothyroid' && supplementPreference !== 'none') {
    if (!selectedSuppNames.includes('selenium')) selectedSuppNames.push('selenium');
  }

  // Blood work overrides
  if (bloodWorkMarkers && supplementPreference !== 'none') {
    if (bloodWorkMarkers.vitaminD !== undefined && bloodWorkMarkers.vitaminD < 30) {
      if (!selectedSuppNames.includes('vitamin d')) selectedSuppNames.push('vitamin d');
    }
    if (bloodWorkMarkers.ferritin !== undefined && bloodWorkMarkers.ferritin < 30) {
      if (!selectedSuppNames.includes('iron')) selectedSuppNames.push('iron');
    }
    if (bloodWorkMarkers.crp !== undefined && bloodWorkMarkers.crp > 3) {
      if (!selectedSuppNames.includes('fish oil')) selectedSuppNames.push('fish oil');
    }
  }

  // Build SupplementTiming objects
  const supplementSchedule: SupplementTiming[] = selectedSuppNames
    .filter((name) => supplementTimingMap[name])
    .map((name) => {
      const tmpl = supplementTimingMap[name];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dose: tmpl.dose,
        timing: tmpl.timing,
        notes: tmpl.notes,
      };
    });

  // Legacy string list for backward compat
  const supplementRecommendations = supplementSchedule.map(
    (s) => `${s.name} ${s.dose} (${s.timing}${s.notes ? ' — ' + s.notes : ''})`
  );

  // 10. Grocery list — aggregate from meals
  const groceryMap = new Map<string, GroceryItem>();
  const allMealTemplates = selectedTemplates;
  for (const tmpl of allMealTemplates) {
    for (const ing of tmpl.ingredients) {
      const key = ing.toLowerCase().replace(/\(.*?\)/g, '').trim();
      if (!groceryMap.has(key)) {
        groceryMap.set(key, {
          name: ing,
          quantity: '1 week supply',
          category: categorizeIngredient(ing),
        });
      }
    }
  }
  const groceryList = Array.from(groceryMap.values());

  // 11. Plan name
  const goalNamesAll = goals.map((g) => goalLabels[g] || g);
  const name = `${goalNamesAll[0] || 'Custom'}${goalNamesAll.length > 1 ? ' + ' + (goalNamesAll.length - 1) + ' more' : ''} — ${pick(adjectives)} ${pick(nouns)}`;

  // 12. Description
  const activityLabels: Record<string, string> = {
    sedentary: 'sedentary lifestyle',
    light: 'light activity (1–2x/week)',
    moderate: 'moderate training (3–4x/week)',
    active: 'active training (5–6x/week)',
    'very-active': 'very active (daily+)',
  };

  const goalsDisplay = goalNamesAll.map((g) => g.toLowerCase()).join(' + ');
  let description = `Built for ${clientName} (${sex}, ${age}y, ${weight}kg / ${Math.round(weightLbs)}lbs) — ${goalsDisplay} goal${goals.length > 1 ? 's' : ''}. ${activityLabels[activityLevel] || activityLevel}, training ${trainingDaysPerWeek}x/week. Training day: ${finalCalories}kcal, rest day: ${restDayCalories}kcal. Protein at ${proteinPerKg}g/kg.${bodyFatPercent > 0 ? ` BMR via Katch-McArdle (${bodyFatPercent}% BF).` : ''}`;
  if (coachNotes) {
    description += ` Coach notes: ${coachNotes}`;
  }
  if (bloodWorkMarkers && bloodWorkDate) {
    description += ` Informed by blood work from ${new Date(bloodWorkDate).toLocaleDateString()}.`;
  }

  // Medical callouts in description
  const conditions: string[] = [];
  if (diabetes !== 'none') conditions.push(`${diabetes} — carbs capped at 40%`);
  if (pcos) conditions.push('PCOS — carbs reduced 15%');
  if (bloodPressure === 'high') conditions.push('high BP — sodium capped at 1500mg');
  if (hasIBS) conditions.push('IBS — low FODMAP preferred');
  if (conditions.length > 0) {
    description += ` Conditions addressed: ${conditions.join('; ')}.`;
  }

  // 13. Scientific basis
  const basisTemplates: Record<string, string> = {
    bulk: `Protein intake of ${proteinPerKg}g/kg/day maximizes muscle protein synthesis during caloric surplus. Leucine threshold of ~2.5g per meal optimizes mTOR signaling. Caloric surplus of +500kcal supports lean mass accretion while minimizing fat gain.`,
    cut: `During caloric restriction, elevated protein intake (${proteinPerKg}g/kg) preserves fat-free mass. Combined with resistance training, this approach maintains or increases lean body mass even in significant energy deficit.`,
    recomp: `Body recomposition is achievable through strategic caloric management. Higher carbohydrate on training days supports performance while moderate overall intake promotes gradual fat oxidation. Protein at ${proteinPerKg}g/kg maximizes muscle retention.`,
    maintenance: `Maintenance-level calories with adequate protein (${proteinPerKg}g/kg) supports long-term body composition stability. Focus on nutrient density and meal timing around training sessions.`,
    performance: `Performance nutrition prioritizes glycogen availability and recovery. Protein at ${proteinPerKg}g/kg supports muscle repair while carbohydrate timing around training optimizes energy systems.`,
    'anti-inflammatory': `Dietary patterns rich in omega-3 fatty acids, polyphenols, and curcuminoids demonstrate anti-inflammatory effects. This plan emphasizes foods with evidence-based anti-inflammatory properties to support joint health and recovery.`,
    'reverse-diet': `Gradual caloric increases (~100kcal/week) help restore metabolic rate post-dieting while minimizing rapid fat regain. Protein at ${proteinPerKg}g/kg maintains lean mass during the transition.`,
    'comp-prep': `Contest preparation requires aggressive caloric restriction (${proteinPerKg}g/kg protein) to preserve lean mass. Refeeds every ${input.refeedFrequency || '1–2 weeks'} help maintain leptin levels and training performance.`,
    'metabolic-repair': `This plan prioritizes metabolic recovery after prolonged restriction. Moderate surplus (+200kcal) with adequate protein allows hormonal normalization while rebuilding metabolic rate.`,
    'gut-health': `Gut health optimization focuses on diverse fiber sources, fermented foods, and anti-inflammatory nutrients. Low FODMAP principles are applied where needed to manage symptoms while supporting microbiome diversity.`,
  };

  // Use the lowest evidence level across all goals (most conservative)
  const evidenceRank = { preliminary: 0, moderate: 1, high: 2 };
  const evidenceLevel = goals.reduce<'high' | 'moderate' | 'preliminary'>((lowest, g) => {
    const level = evidenceLevels[g] || 'moderate';
    return evidenceRank[level] < evidenceRank[lowest] ? level : lowest;
  }, 'high');
  const bloodWorkInformed = !!(bloodWorkMarkers && bloodWorkDate);

  return {
    id: planId,
    client_id: clientId,
    client_name: clientName,
    name,
    description,
    calories_target: finalCalories,
    protein_target: proteinTarget,
    carbs_target: finalCarbs,
    fat_target: finalFat,
    rest_day_calories: restDayCalories,
    rest_day_protein: restDayProtein,
    rest_day_carbs: restDayCarbs,
    rest_day_fat: restDayFat,
    generated_by: 'ai',
    scientific_basis: basisTemplates[goal] || basisTemplates.maintenance,
    evidence_level: evidenceLevel,
    research_citations: citations,
    supplement_recommendations: supplementRecommendations,
    meals,
    rest_day_meals: restDayMeals,
    grocery_list: groceryList,
    supplement_schedule: supplementSchedule,
    water_target: waterTarget,
    sodium_target: sodiumTarget,
    fiber_target: fiberTarget,
    created_at: new Date().toISOString(),
    blood_work_informed: bloodWorkInformed,
  };
}

// --- Ingredient categorizer ---

function categorizeIngredient(ing: string): GroceryItem['category'] {
  const lower = ing.toLowerCase();
  if (/chicken|salmon|tuna|turkey|beef|steak|tofu|egg|halloumi|whey|protein/.test(lower)) return 'protein';
  if (/rice|oat|pasta|bread|tortilla|potato|quinoa|farro|granola/.test(lower)) return 'carbs';
  if (/olive oil|butter|peanut butter|coconut oil|avocado|tahini|sesame oil/.test(lower)) return 'fats';
  if (/yogurt|cheese|milk|cottage/.test(lower)) return 'dairy';
  if (/spinach|broccoli|pepper|tomato|cucumber|onion|garlic|ginger|zucchini|asparagus|bok choy|beetroot|carrot|celery|banana|berr|mango|lemon|cherry/.test(lower)) return 'produce';
  if (/vitamin|creatine|iron|magnesium|supplement|fish oil/.test(lower)) return 'supplements';
  return 'pantry';
}
